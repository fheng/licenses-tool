This is a command line tool to generate licenses.txt file for given fh components.

# To use

All you have to do is to provide a meta data file to describe the dependencies, and have the corresponding license file added to the [licenses](./licenses) directory.

For example, if you have meta.json file like this:

```javascript
{
  "name":"foo",
  "libs": ["bar"]
}
```

Then make sure there is a `bar.txt` file in the licenses dir.

Then run

```bash
node generate.js -m meta.json <target dir to write the generated licenses.txt file>
```

It will generate a licenses.txt file in the target dir.

package.json is supported too.

# Generate an overarching licenses.txt file for multiple components

Create a JSON file to describe paths of the components' meta data file in an array (see [all.json](./metadata/all.json) for example), and run

```bash
node generate.js -a all.json <target dir to write the generated licenses.txt file>
```

# About the license txt file

Each license file should use the following format:

* line 1: the name of the component
* line 2: The type of the license e.g. MIT, Apache 2.0, BSD
* line 3: The link to the license file (can be empty)

The rest should be the content of the licenses.

