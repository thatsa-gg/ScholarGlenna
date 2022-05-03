TSC=npx tsc
PROJECT=glenna
.PHONY: all $(PROJECT) build clean run

$(PROJECT): build
all: clean $(PROJECT)

build:
	$(TSC) --build src

watch:
	$(TSC) --watch src

run: $(PROJECT)
	node --es-module-specifier-resolution=node --experimental-import-meta-resolve .

clean:
	rm -rf build *.tsbuildinfo
