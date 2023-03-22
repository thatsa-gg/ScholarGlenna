DELEGATE_PRISMA = $(addprefix prisma.,migrate migrate-reset migrate-status generate)
DELEGATE_APP = $(addprefix app.,build dev package sync check)
DELEGATE_BOT = $(addprefix bot.,start)
RUSH_COMMAND = install build rebuild
DOCKER_REGISTRY = registry.digitalocean.com
.PHONY: glenna all clean clean-build clean-deploy deploy
.PHONY: $(RUSH_COMMAND)
.PHONY: $(DELEGATE_PRISMA) $(DELEGATE_APP) $(DELEGATE_BOT)
.PHONY: clean-common/deploy/app clean-common/deploy/bot common/deploy/bootstrap

glenna: install build
all: clean install build

$(RUSH_COMMAND):
	rush $@

clean: clean-build clean-deploy
clean-build:
	rush clean
clean-deploy: clean-common/deploy/app clean-common/deploy/bot clean-common/deploy/bootstrap

deploy: common/deploy/app common/deploy/bot common/deploy/bootstrap
common/deploy/app: build
	mkdir -p $@
	rush deploy --target-folder $@ --scenario $(notdir $@)
common/deploy/bot: build
	mkdir -p $@
	rush deploy --target-folder $@ --scenario $(notdir $@)
common/deploy/bootstrap: build
	mkdir -p $@
	rush deploy --target-folder $@ --scenario $(notdir $@)
clean-common/deploy/app:
	rm -rf common/deploy/app
clean-common/deploy/bot:
	rm -rf common/deploy/bot
clean-common/deploy/bootstrap:
	rm -rf common/deploy/bootstrap

.PHONY: docker docker/app docker/bot docker/bootstrap
docker: docker/app docker/bot docker/bootstrap
docker/app: common/deploy/app
	docker build "$<" -f "$@/Dockerfile" -t $(DOCKER_REGISTRY)/thatsa-gg/scholar-glenna-app:latest
docker/bot: common/deploy/bot
	docker build "$<" -f "$@/Dockerfile" -t $(DOCKER_REGISTRY)/thatsa-gg/scholar-glenna-bot:latest
docker/bootstrap: common/deploy/bootstrap
	docker build "$<" -f "$@/Dockerfile" -t $(DOCKER_REGISTRY)/thatsa-gg/scholar-glenna-bootstrap:latest

.PHONY: push push-app push-bot push-bootstrap
push: push-app push-bot push-bootstrap
push-app:
	docker image push $(DOCKER_REGISTRY)/thatsa-gg/scholar-glenna-app:latest
push-bot:
	docker image push $(DOCKER_REGISTRY)/thatsa-gg/scholar-glenna-bot:latest
push-bootstrap:
	docker image push $(DOCKER_REGISTRY)/thatsa-gg/scholar-glenna-bootstrap:latest

$(DELEGATE_PRISMA):
	pnpm --prefix packages/prisma run $(patsubst prisma.%,%,$@)

$(DELEGATE_APP):
	pnpm --prefix src/app run $(patsubst app.%,%,$@)

$(DELEGATE_BOT):
	pnpm --prefix src/bot run $(patsubst bot.%,%,$@)

.PHONY: prepare-dev-environment inject-make-function docker-login
prepare-dev-environment:
	npm install -g @microsoft/rush

inject-make-function:
	[ -f ~/.bash_aliases ] && grep 'make() (' ~/.bash_aliases >/dev/null || cat .devcontainer/.bash_aliases >> ~/.bash_aliases

docker-login:
	docker login $(DOCKER_REGISTRY)
