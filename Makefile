all:
	@echo "Setting up environment... \n"
	pip install -r server/requirements.txt
	cd client; npm install
	@echo "\nAll good to go!\n"
	@echo "Proceed to execute make server and client\n"	

.PHONY: server
server:
	@echo "Building Server\n"
	python ./server/main.py

.PHONY: client
client:
	@echo "Building Client\n"
	cd ./client; ng serve -o
