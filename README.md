This is a command line tool to generate licenses.txt file for a given fh component.

# To use

This tool is developed for nodejs modules, although it can be used for other type of applications by creating a package.json file. Just make sure there is a correponding txt file in the [licenses](./licenses) dir for each of the dependencies specified.

For example, if you have package.json file like this:

```javascript
{
  'dependencies': {
    'foo': '1.0'
  }
}
```

Then make sure there is a `foo.txt` file in the licenses dir.

Then run

```bash
node generate.js <path to the dir containing package.json file>
```

It will generate a licenses.txt file in the target dir.

# About the license txt file

Each license file should use the following format:

line 1: the name of the component
line 2: The type of the license e.g. MIT, Apache 2.0
line 3: The link to the license file

The rest should be the content of the licenses.

