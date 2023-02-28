DELEGATE_PRISMA = migrate migrate-reset migrate-status generate
DELEGATE_APP = $(addprefix app.,build dev package sync check)
.PHONY: glenna all clean install
.PHONY: build build-app build-bot build-ts
.PHONY: $(DELEGATE_PRISMA) $(DELEGATE_APP)

glenna: install build
all: clean install build

clean:
	find packages -type d -name node_modules -prune -o -type f -name *.tsbuildinfo -exec rm {} \;
	find scripts -type d -name node_modules -prune -o -type f -name *.tsbuildinfo -exec rm {} \;
	rm -rf build packages/*/dist app/build *.tsbuildinfo

install:
	pnpm install

build: build-app build-bot
build-app: build-ts app.build
build-bot: build-ts
build-ts:
	pnpm exec tsc --build

run:
	node --es-module-specifier-resolution=node --experimental-import-meta-resolve .

$(DELEGATE_PRISMA):
	pnpm --prefix packages/prisma run $@

$(DELEGATE_APP):
	pnpm --prefix app run $(patsubst app.%,%,$@)
