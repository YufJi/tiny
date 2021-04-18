# mp-compiler

compile mp app into react app.

--------------------


## require('mp-compiler')(src:string, out:string, config)

### config


#### config.src

tiny app source dir

#### config.out

react app output dir

#### config.library

mp library path, such as '@alipay/af-mp/lib'

### config.templateExtname

template file extname, such as '.axml'

### config.styleExtname

stylesheet file extname, such as '.acss'

### config.templateNamespace

template namespace(a:if, a:for), such as 'a'

### config.bridgeName

bridge name, such as 'abridge'

### config.omitEndTag

Similar to HTML, allowing template end tag to be omitted

### config.showFileNameInError

Show the path of the file where the error is located. The default value in cli is true, false in loader
