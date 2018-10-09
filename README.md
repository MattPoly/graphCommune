# graphCommune


## Using docker
If you are using a Windows OS, you need to install Docker for Windows and use the powershell

```bash
# go to your project folder
cd /path/to/graph-commune

# build the docker's image using project's sources
docker build -t custom/graph-commune .

# create docker's container from the image and mount project's folder on the container
# For Windows, you cannot use $(pwd), you need to replace by the absolute path to your project
docker create --name graph-commune -v $(pwd)/app:/var/www/graph-commune/app -p 8080:8080 custom/graph-commune

# start the container
docker start graph-commune
```
