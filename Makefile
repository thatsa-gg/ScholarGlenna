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
	node .

clean:
	rm -rf build *.tsbuildinfo
