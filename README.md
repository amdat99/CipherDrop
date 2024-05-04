"# CipherDrop"

## Setup

- To run the project, you need to have Dotnet installed. You can download it from [here](https://dotnet.microsoft.com/download).

- A .env file should be created in the CipherDrop directory with the same content as the .env.example file. You can use the EncryptionKey in the .env.example file for development. This key will be used to encrypt and decrypt server-side data

## Running the project

In the CipherDrop directory, run the following command:

```
dotnet watch run
```

After pressing enter, the server will start and you can access the application at `http://localhost:5245`

## Running Production Build

When running in production before the server starts you will be prompted to add the encryption key in the terminal. This key should be different from the one used in development and kept seperate from the source code for security reasons.
