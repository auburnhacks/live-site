FROM python:3.7.2-alpine
WORKDIR /usr/src/app

# Copy requirements and install all dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py main.py

ENTRYPOINT [ "python", "main.py" ]