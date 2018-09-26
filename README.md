# graphCommune


## Using docker
```bash
# build the docker's image
docker build -t custom/graph-commune .

# create docker's container of the image
docker create --name graph-commune -v $(pwd):/var/www/graph-commune -p 8080:8080 custom/graph-commune

# start the container
docker start graph-commune
```
