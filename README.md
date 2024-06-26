1. Build MSSQL docker container for our Application's Database requirement
    Follow the below steps
    1. docker pull mcr.microsoft.com/mssql/server
    2. docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Welcome@123' -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server
    update the above command with your desired password for user SA in SA_PASSWORD
2. Create DB Tables for the Application requirement
        1. Create database with any name and update the DB_DATABASE in the 3.2 point
        2. create the required tables in the database by following below sql queries
 CREATE TABLE Apartments (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  Domain NVARCHAR(255) NULL
);

CREATE TABLE Admins (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Username NVARCHAR(50) NOT NULL,
  Password NVARCHAR(255) NOT NULL
);

CREATE TABLE Users (
  Id INT PRIMARY KEY IDENTITY(1,1),
  Name NVARCHAR(100),
  Email NVARCHAR(100) UNIQUE,
  Password NVARCHAR(100),
  ApartmentId INT,
  Role NVARCHAR(50),
  Approved BIT NOT NULL DEFAULT 0
  FOREIGN KEY (ApartmentId) REFERENCES Apartments(Id)
);               
2. Build and run the backend container
    1. cd server
    2. vi .env  #Update the environment variables based on your network and passwords
        DB_USER=sa
        DB_PASSWORD=Welcome@123
        DB_SERVER=192.168.29.143
        DB_DATABASE=Apartments
        SERVER_HOST=192.168.29.161

    3. build the image using the below command
        docker build -t name/reponame .
    4. Run the container using the below command # to check the connectivity remove '-d' in below command
        docker run -d -p 3001:3001 name/reponame --name containername
3. Build and run the Frontend container
    1. cd client
    2. vi .env #update the environment variables to update the backend url here
        REACT_APP_BACKEND_URL=http://192.168.29.161:3001
    3. docker build -t name/reponamefrontend .
    4. docker run -d -p 3000:3000 name/reponamefrontend --name containername
4. Access Application using the http://localhost:3000 / http://HostIP:3000

