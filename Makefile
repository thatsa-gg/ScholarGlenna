TSC=npx tsc
PROJECT=glenna
.PHONY: all $(PROJECT) build clean run

$(PROJECT): build
all: clean $(PROJECT)

build:
	$(TSC) --build

watch:
	$(TSC) --watch

run: $(PROJECT)
	node --es-module-specifier-resolution=node --experimental-import-meta-resolve .

clean:
	rm -rf build *.tsbuildinfo packages/*/dist
