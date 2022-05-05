TSC=npx tsc
PROJECT=glenna
.PHONY: all $(PROJECT) build clean run install

$(PROJECT): build
all: clean install $(PROJECT)

build:
	$(TSC) --build

watch:
	$(TSC) --watch

run: $(PROJECT)
	node --es-module-specifier-resolution=node --experimental-import-meta-resolve .

install:
	pnpm install

clean:
	find packages -type d -name node_modules -prune -o -type f -name *.tsbuildinfo -exec rm {} \;
	rm -rf build packages/*/dist *.tsbuildinfo
