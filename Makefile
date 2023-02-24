TSC=npx tsc
PROJECT=glenna
.PHONY: all $(PROJECT) build clean run install svelte-dev svelte-build svelte-package svelte-preview svelte-prepare ts-build ts-dev init

$(PROJECT): build
all: clean install $(PROJECT)

build: ts-build svelte-build
run:
	node --es-module-specifier-resolution=node --experimental-import-meta-resolve .

install:
	pnpm install

clean:
	find packages -type d -name node_modules -prune -o -type f -name *.tsbuildinfo -exec rm {} \;
	find scripts -type d -name node_modules -prune -o -type f -name *.tsbuildinfo -exec rm {} \;
	rm -rf build packages/*/dist app/build *.tsbuildinfo

init: install

ts-dev:
	$(TSC) --watch

ts-build:
	pnpm run build

dev:
	pnpm --prefix app run dev

svelte-build:
	pnpm --prefix app run build

svelte-package:
	pnpm --prefix app run package

svelte-preview:
	pnpm --prefix app run preview

svelte-prepare:
	pnpm --prefix app run prepare

sync:
	pnpm --prefix app run prepare
