## How to run server on anthonytambrin.com

1. SSH into DreamHost - `ssh jumpy@anthonytambrin.com`
2. Paste in password from password manager
3. Once logged in, make sure to go to user's directory - `cd ~`
4. Install NVM `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`
5. Run `source .bashrc`
6. Run `setfattr -n user.pax.flags -v "mr" $NVM_DIR/nvm.sh`
7. Run `nvm install v12.20.0`
8. Run `nvm alias default v12.20.0`
9. Run `ssh-keygen -o -t rsa -C jumpy@anthonytambrin.com` to create SSH key
10. Run `cat ~/.ssh/id_rsa.pub`, copy the content, and paste it to Bitbucket repo security
11. Run `git clone git@bitbucket.org:copet80/jumpy.git`
12. Run `cd jumpy` to go into the project folder
13. Run `npm install -g bower gulp@3.9.1`
14. Run `npm install`
15. Run `gulp admin`
16. Open `https://jumpy.anthonytambrin.com/admin/`

## Troubleshooting

If the following error occurs when running `gulp server`,
`ReferenceError: primordials is not defined`

...make sure the `npm-shrinkwrap.json` only contains the following:

```
{
  "dependencies": {
    "graceful-fs": {
        "version": "4.2.2"
     }
  }
}
```
