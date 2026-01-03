# Stage 1: Build Frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /app
COPY backend/PiataOnline.Core/PiataOnline.Core.csproj backend/PiataOnline.Core/
COPY backend/PiataOnline.Infrastructure/PiataOnline.Infrastructure.csproj backend/PiataOnline.Infrastructure/
COPY backend/PiataOnline.API/PiataOnline.API.csproj backend/PiataOnline.API/
RUN dotnet restore backend/PiataOnline.API/PiataOnline.API.csproj

COPY backend/ ./backend/
WORKDIR /app/backend/PiataOnline.API
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
EXPOSE 8080
LABEL service="piata_online"

COPY --from=backend-build /app/publish .
# Copy frontend build to wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot

ENTRYPOINT ["dotnet", "PiataOnline.API.dll"]
