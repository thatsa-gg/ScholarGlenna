make() (
    until [ "$(pwd)" == "/" ] || [ -f GNUMakefile ] || [ -f makefile ] || [ -f Makefile ]; do
        cd ..
    done
    /usr/bin/make "$@"
)
