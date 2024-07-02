# Description
This project allows to compile separated HTML files into a single HTML file.

# Usage
To use this module you need to separate your HTML structure to a single component per file.
After that you need to use the `<static-import>PATH</static-import>` to place a component in
it's place.

Then run:
```bash
npm install -g super-html-compiler
html-compile input.html output.html

OR

npm install super-html-compiler --save-dev
npx html-compile input.html output.html
```

# Example
**file structure:**
```
* (project root / cwd)
|
|--- * (src)
|    |
|    |--- * (_header.html)
|    |
|    |--- * (index.template.html)
|
|--- * (out)
```

**src/_header.html:**
```html
<header>
    <a href="someLink">Link1</a>
    <a href="someLink2">Link2</a>
</header>
```

**src/index.template.html:**
```html
<html>
    <head>
        <title>Example</title>
    </head>
    <body>
        <static-import>./_header.html</static-import>
        <div class="body">blah blah blah</div>
    </body>
</html>
```

To generate `out/index.html` run:
```bash
html-compile src/index.template.html out/index.html
```

**out/index.html:**
```html
<html>
    <head>
        <title>Example</title>
    </head>
    <body>
        <header>
            <a href="someLink">Link1</a>
            <a href="someLink2">Link2</a>
        </header>
        <div class="body">blah blah blah</div>
    </body>
</html>
```


# All available tags and their uses

| name                           | description                                                                                                                                     |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| static-import                  | Allows to include external resources to the final html. (Note: The resources are simply copy-pasted)                                            |
| static-requirement             | Add all contents of this tag to the head of the final html (if a head exists). Can be used to define requirements inside of external resources. |
| static-requirement-placeholder | Specify a location to put all requirements from <static-requirement> tags                                                                       |
| static-placeholder             | Allows to replace content dynamically with a <static-import> tag. REQUIRED ATTRIBUTES: name                                                     |
| static-parameter               | Specifies the contents to use in place of a placeholder. This tag is usable ONLY inside a <static-import> tag. REQUIRED ATTRIBUTES: name        |
| static-attribute               | Allows to set the attribute of the parent to whatever value is between the tags. REQUIRED ATTRIBUTES: name, OPTIONAL ATTRIBUTES: remove-on      |


# CLI options
| short name | long name                         | default | description                                                       |
|------------|-----------------------------------|---------|-------------------------------------------------------------------|
| `-p`       | `--project-root`                  | `.`     | The `path` to prepend to all `paths` in `<static-*>` tags         |
|            | `--allow-duplicated-requirements` | `false` | Wether to allow the specification of a requirement multiple times |

# JS options
## Class: Compiler
| name                          | type      | default     | description                                                       |
|-------------------------------|-----------|-------------|-------------------------------------------------------------------|
| cwd                           | `string`  |             | The `path` to prepend to all `paths` in `<static-*>` tags         |
| allow_duplicated_requirements | `boolean` | `false`     | Wether to allow the specification of a requirement multiple times |

# GRUNT options
## Task: super_html_compiler
| name                          | type      | default | description                                                       |
|-------------------------------|-----------|---------|-------------------------------------------------------------------|
| cwd                           | `string`  | `.`     | The `path` to prepend to all `paths` in `<static-*>` tags         |
| allow_duplicated_requirements | `boolean` | `false` | Wether to allow the specification of a requirement multiple times |