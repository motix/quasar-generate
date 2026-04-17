# mkcerts Installation Instructions

1. On Windows, use Chocolatey.

```
> choco install mkcert
> mkcert -install
> mkcert localhost 127.0.0.1 ::1
```

2. Rename `localhost+2.pem` to `server.crt`.  
   Rename `localhost+2-key.pem` to `server.key`.  
   Put those 2 files to this `mkcerts` folder.

3. Add `mkcerts/server.*` to `.gitignore`.
