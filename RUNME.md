## How to run server on anthonytambrin.com

1. SSH into DreamHost - `ssh jumpy@anthonytambrin.com`
2. Paste in password from password manager
3. Once logged in, make sure to go to user's directory - `cd ~` 
4. Install NVM `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`
5. Run ```export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion```
6. Run `source .bashrc`
7. Run `setfattr -n user.pax.flags -v "mr" $NVM_DIR/nvm.sh`
8. Run `nvm install v12.20.0`
9. Run `nvm alias default v12.20.0`
10. Run `ssh-keygen -o -t rsa -C jumpy@anthonytambrin.com` to create SSH key
11. Run `cat ~/.ssh/id_rsa.pub`, copy the content, and paste it to Bitbucket repo security
12. Run `git clone git@bitbucket.org:copet80/jumpy.git`
13. Run `cd jumpy` to go into the project folder
14. Run `npm install -g bower gulp@3.9.1`
15. Run `npm install`
16. Run `gulp server`