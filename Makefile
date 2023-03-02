DELEGATE_PRISMA = $(addprefix prisma.,migrate migrate-reset migrate-status generate)
DELEGATE_APP = $(addprefix app.,build dev package sync check)
DELEGATE_BOT = $(addprefix bot.,start)
.PHONY: glenna all clean clean-build clean-deploy install build deploy
.PHONY: $(DELEGATE_PRISMA) $(DELEGATE_APP) $(DELEGATE_BOT)

glenna: install build
all: clean install build

clean: clean-build clean-deploy
clean-build:
	rush clean
clean-deploy:
	rm -rf common/deploy
pwd:
	pwd

install:
	rush install

build:
	rush build

rebuild:
	rush rebuild

deploy: build clean-deploy common/deploy/app common/deploy/bot
common/deploy/%:
	mkdir -p $@
	rush deploy --target-folder $@ --scenario $(notdir $@)

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
