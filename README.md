# graphCommune


## Using docker
```bash
# go to your project folder
cd /path/to/graph-commune

# build the docker's image using project's sources
docker build -t custom/graph-commune .

# create docker's container from the image and mount project's folder on the container
docker create --name graph-commune -v $(pwd):/var/www/graph-commune -p 8080:8080 custom/graph-commune

# start the container
docker start graph-commune
```
