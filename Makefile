DELEGATE_PRISMA = $(addprefix prisma.,migrate migrate-reset migrate-status generate)
DELEGATE_APP = $(addprefix app.,build dev package sync check)
.PHONY: glenna all clean clean-build clean-deploy install rush-install build deploy
.PHONY: $(DELEGATE_PRISMA) $(DELEGATE_APP)

glenna: install build
all: clean install build

clean: clean-build clean-deploy
clean-build:
	rush clean
clean-deploy:
	rm -rf common/deploy

install: rush-install prisma.generate
rush-install:
	rush install

build:
	rush build

deploy: build clean-deploy common/deploy/app common/deploy/bot
common/deploy/%:
	mkdir -p $@
	rush deploy --target-folder $@ --scenario $(patsubst common/deploy/%,%,$@)

$(DELEGATE_PRISMA):
	pnpm --prefix packages/prisma run $(patsubst prisma.%,%,$@)

$(DELEGATE_APP):
	pnpm --prefix src/app run $(patsubst app.%,%,$@)
