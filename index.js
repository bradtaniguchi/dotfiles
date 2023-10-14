// @ts-check
const { mkdir, readFile, appendFile } = require("fs-extra");
const { join } = require("path");

/**
 * The home directory path
 * @readonly
 */
const HOME_DIR = process.env.HOME || "/home/$(whoami)";

/**
 * Returns file relative to home
 *
 * @param {string} path the default path
 * @returns {string} the full path from the home directory
 */
const getFromHome = (path) => join(HOME_DIR, path);

/**
 * Returns the file path relative to this file
 *
 * @param {string} path the path to get relative to this file
 * @returns {string} the relative path
 */
const getRelative = (path) => join(__dirname, path);

(async () => {
  try {
    console.log(">> starting...");

    console.log(">> creating nvim directory, if there isn't one");
    await mkdir(getFromHome(".config/nvim"), { recursive: true });

    const [currZshrc, currBashrc, newRcs, newAliases] = await Promise.all([
      // current file contents
      readFile(getFromHome(".zshrc"), "utf8").catch(() => false),
      readFile(getFromHome(".bashrc"), "utf8").catch(() => false),

      // new file contents, if missing throw
      readFile(getRelative("system/.rc"), "utf8"),
      readFile(getRelative("system/.aliases"), "utf8"),
    ]);

    /**
     * Fills the corresponding file with the new contents
     *
     * @param {'.zshrc' | '.bashrc'} file the file to check
     * @param {string | boolean} contents the new contents to add, can handle boolean for empty files
     */
    const checkFile = async (file, contents) => {
      if (!contents) {
        console.log(">> no zshrc file exists, found or its empty. Skipping");
      } else if (contents === true) {
        throw new Error("Unknown current .zshrc state");
      } else {
        if (contents.includes(newRcs)) {
          // if the values are already included, then skip
          console.log(">> .zshrc already has .rc file contents");
        } else if (!contents.includes(newRcs)) {
          console.log(">> .zshrc does not have .rc file contents, adding them");
          await appendFile(getFromHome(".zshrc"), "\n" + contents, "utf8");
        }

        if (contents.includes(newAliases)) {
          // if the values are already included, then skip
          console.log(">> .zshrc already has .aliases file contents");
        } else if (!contents.includes(newAliases)) {
          console.log(
            ">> .zshrc does not have .aliases file contents, adding them"
          );
          await appendFile(getFromHome(".zshrc"), "\n" + contents, "utf8");
        }
      }
    };

    console.log(
      '>> checking ".zshrc" and ".bashrc" files for system/.aliases and system/.rc'
    );
    await Promise.all([
      checkFile(".zshrc", currZshrc),
      checkFile(".bashrc", currBashrc),
    ]);

    console.log(">> done setting up system files");

    // TODO add support for checking if a file exists or not for the rest of the files

    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
