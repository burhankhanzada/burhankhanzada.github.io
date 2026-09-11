# Control Engineering

The built site, served at <https://burhankhanzada.github.io/>.

An interactive trainer for an undergraduate control engineering module: from a picture of a
machine to a controller you can defend. Fifty-two lessons in nine parts, fourteen whole tasks
off eight past papers under their own marking schemes, ten appendices, twenty-six maths notes,
a formula sheet, a glossary and a solver lab.

**This repository is generated.** Nothing here is edited by hand — it is `app/dist` from a
private source repository, copied in whole. To change anything, change it there and publish
again.

`.nojekyll` is load-bearing: the build puts its CSS, JavaScript and fonts under `_assets/`, and
GitHub Pages runs Jekyll by default, which ignores any directory whose name starts with an
underscore. Without that file every stylesheet and script on every page returns 404.
