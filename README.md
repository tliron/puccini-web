Puccini for the Web
===================

[See it live!](https://web.puccini.cloud/)

What Is This?
-------------

The [Puccini](https://puccini.cloud/) project consists of deliberately stateless cloud
topology management and deployment tools based on
[TOSCA](https://www.oasis-open.org/committees/tosca/).

Its primary intended use is to be incorporated into a cloud orchestration or design toolchain.

However, because Puccini can also be compiled into [WebAssembly](https://webassembly.org/)
(it is written in Go), it can also be run inside a web browser. As such it could be useful for
developing web-based GUI frontends, or even IDEs, that use TOSCA.

To emphasize: there is **no server-side code** involved in this implementation. Puccini is running
entirely within the client browser.

This simple live demo can be used to validate your TOSCA with Puccini, or as the basis for a more
extensive IDE.

The in-browser YAML editor is [Ace](https://ace.c9.io/).

Demo Limitations
----------------

If you use the in-browser YAML editor then your TOSCA cannot use relative `imports`. The reason
should be obvious: there is no base URL for this YAML text, which is provided to Puccini as if it
were `stdin`. Parsing from an external URL does indeed support relative `imports`.

Also, this demo currently does not support parsing
[CSAR files](https://docs.oasis-open.org/tosca/TOSCA-Simple-Profile-YAML/v1.3/cos01/TOSCA-Simple-Profile-YAML-v1.3-cos01.html#_Toc26969474), even from external URLs. The reason is that Puccini currently implements
this feature by downloading the CSAR to `/tmp`, which is not supported by the browser's runtime
environment. This might be improved in the future. To test your CSARs you will need to run
Puccini locally. It's small, stateless, and easy to use. Don't be scared!

Finally, there is currently no support in the demo for providing topology template `inputs`. We
might add this feature in the future. As a workaround, for now provide a `default` value for
inputs. Again, `inputs` are fully supported when running Puccini locally.

