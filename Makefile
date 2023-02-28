DELEGATE_PRISMA = $(addprefix prisma.,migrate migrate-reset migrate-status generate)
DELEGATE_APP = $(addprefix app.,build dev package sync check)
.PHONY: glenna all clean clean-build clean-deploy install pnpm-install
.PHONY: build build-app build-bot build-ts
.PHONY: $(DELEGATE_PRISMA) $(DELEGATE_APP)

glenna: install build
all: clean install build

clean: clean-build clean-deploy
clean-build:
	find packages src \
		-type d -name node_modules -prune \
		-type d -name .svelte-kit -prune \
		-o -type f -name *.tsbuildinfo \
		-o -type d -name dist \
		-o -type d -name build \
		-exec rm -r {} \;
clean-deploy:
	rm -rf build

install: pnpm-install prisma.generate
pnpm-install:
	pnpm install

build: build-app build-bot
build-app: build-ts app.build
build-bot: build-ts
build-ts: prisma.generate
	pnpm exec tsc --build

run:
	node --es-module-specifier-resolution=node --experimental-import-meta-resolve .

$(DELEGATE_PRISMA):
	pnpm --prefix packages/prisma run $(patsubst prisma.%,%,$@)

$(DELEGATE_APP):
	pnpm --prefix src/app run $(patsubst app.%,%,$@)
