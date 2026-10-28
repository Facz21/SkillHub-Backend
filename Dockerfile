# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app

# Copy project files and restore dependencies
COPY src/SkillHub.Domain/SkillHub.Domain.csproj src/SkillHub.Domain/
COPY src/SkillHub.Application/SkillHub.Application.csproj src/SkillHub.Application/
COPY src/SkillHub.Infrastructure/SkillHub.Infrastructure.csproj src/SkillHub.Infrastructure/
COPY src/SkillHub.Api/SkillHub.Api.csproj src/SkillHub.Api/

RUN dotnet restore src/SkillHub.Api/SkillHub.Api.csproj

# Copy source code and publish
COPY src/ src/
RUN dotnet publish src/SkillHub.Api/SkillHub.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app/publish .
COPY SkillHub_Data.xlsx ./SkillHub_Data.xlsx

# Expose API port
EXPOSE 5076
ENV ASPNETCORE_URLS=http://+:5076
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "SkillHub.Api.dll"]
