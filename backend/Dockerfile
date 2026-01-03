# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["PiataOnline.API/PiataOnline.API.csproj", "PiataOnline.API/"]
COPY ["PiataOnline.Core/PiataOnline.Core.csproj", "PiataOnline.Core/"]
COPY ["PiataOnline.Infrastructure/PiataOnline.Infrastructure.csproj", "PiataOnline.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "PiataOnline.API/PiataOnline.API.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/PiataOnline.API"
RUN dotnet build "PiataOnline.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "PiataOnline.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Copy published files
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "PiataOnline.API.dll"]
