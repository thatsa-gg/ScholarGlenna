DELEGATE_PRISMA = $(addprefix prisma.,migrate migrate-reset migrate-status generate)
DELEGATE_APP = $(addprefix app.,build dev package sync check)
DELEGATE_BOT = $(addprefix bot.,start)
RUSH_COMMAND = install build rebuild
.PHONY: glenna all clean clean-build clean-deploy deploy
.PHONY: $(RUSH_COMMAND)
.PHONY: $(DELEGATE_PRISMA) $(DELEGATE_APP) $(DELEGATE_BOT)

glenna: install build
all: clean install build

$(RUSH_COMMAND):
	rush $@

clean: clean-build clean-deploy
clean-build:
	rush clean
clean-deploy: clean-common/deploy/app clean-common/deploy/bot

.PHONY: clean-common/deploy/app clean-common/deploy/bot
deploy: common/deploy/app common/deploy/bot
common/deploy/app: build clean-common/deploy/app
	mkdir -p $@
	rush deploy --target-folder $@ --scenario $(notdir $@)
common/deploy/bot: build clean-common/deploy/bot
	mkdir -p $@
	rush deploy --target-folder $@ --scenario $(notdir $@)
clean-common/deploy/app:
	rm -rf common/deploy/app
clean-common/deploy/bot:
	rm -rf common/deploy/bot

.PHONY: docker docker/app docker/bot
docker: docker/app docker/bot
docker/app: common/deploy/app
	docker build "$<" -f "$@/Dockerfile" -t thatsa-gg/scholar-glenna/app:latest
docker/bot: common/deploy/bot
	docker build "$<" -f "$@/Dockerfile" -t thatsa-gg/scholar-glenna/bot:latest

$(DELEGATE_PRISMA):
	pnpm --prefix packages/prisma run $(patsubst prisma.%,%,$@)

$(DELEGATE_APP):
	pnpm --prefix src/app run $(patsubst app.%,%,$@)

$(DELEGATE_BOT):
	pnpm --prefix src/bot run $(patsubst bot.%,%,$@)

.PHONY: prepare-dev-environment inject-make-function
prepare-dev-environment:
	npm install -g @microsoft/rush

inject-make-function:
	[ -f ~/.bash_aliases ] && grep 'make() (' ~/.bash_aliases >/dev/null || cat .devcontainer/.bash_aliases >> ~/.bash_aliases
