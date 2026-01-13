# Golf Club Management Application

## Namen in uporaba aplikacije

Aplikacija predstavlja celovit sistem za upravljanje golf klubov, razvit kot mikroservisna arhitektura na platformi Kubernetes. Sistem omogoča digitalizacijo vseh ključnih procesov golf kluba, vključno z upravljanjem članov, organizacijo turnirjev, rezervacijami in najemom opreme.

### Ključne funkcionalnosti

- **Upravljanje članov**: Registracija, avtentikacija in upravljanje uporabniških profilov
- **Rezervacijski sistem**: Rezervacije igrišč in terminov s preverjanjem dostopnosti
- **Organizacija turnirjev**: Implementiran bracket sistem (single/double elimination)
- **Najem opreme**: Sistem za izposojo golf opreme z evidenco inventarja
- **Trenerstvo**: Rezervacije treningov in upravljanje trenerskih storitev
- **Administrativni panel**: Upravljanje zaposlenih, dovoljenj in klubskih aktivnosti

### Prenosljivost sistema

Sistem je zasnovan univerzalno in je primeren za različne tipe športnih društev. Turnirski modul uporablja bracket sistem, ki je aplicabilen na različne športe (tenis, košarka, namizni tenis), medtem ko so rezervacije, najem opreme in trenerstvo koncepti, ki so neposredno prenosljivi. Golf je služil kot referenčni primer implementacije.

---

## Best Practices

### Arhitekturni vzorci

**Mikroservisna arhitektura**  
Sistem je razdeljen na samostojne servise z lastnimi domenami odgovornosti. Vsak mikroservis upravlja svojo bazo podatkov, kar zagotavlja ločenost in neodvisnost servisov.

**API Gateway pattern**  
Frontend aplikacija deluje kot API gateway, ki s pomočjo NGINX reverse proxy usmerja zahteve proti ustreznim backend servisom.

**Service Discovery**  
Kubernetes DNS se uporablja za medsebojno komunikacijo med servisi (npr. `http://turnirji:8080`).

### Containerizacija

**Multi-stage Docker builds**  
Vsi servisi uporabljajo multi-stage build proces, ki ločuje build in runtime okolje. To zmanjšuje velikost končnih Docker image-ov.

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Alpine Linux base images**  
Runtime environment uporablja Alpine Linux za manjšo porabo virov.

### Kubernetes organizacija

**ClusterIP za interne servise**  
Vsi backend servisi uporabljajo ClusterIP tip servisa in so dostopni samo znotraj clustra. Samo Ingress Controller uporablja LoadBalancer tip, kar minimizira porabo javnih IP naslovov (Azure limit 3 javne IP na subscription).

**Resource limits**  
Definirane so CPU in memory omejitve za vse pode:

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "50m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

### Varnost

**HTTPS z Let's Encrypt**  
Implementiran je avtomatski SSL certifikat preko cert-manager in Let's Encrypt.

**Secrets management**  
Občutljivi podatki (gesla, API ključi) so shranjeni v Kubernetes Secrets in se injektirajo kot environment variable:

```yaml
env:
  - name: SPRING_DATASOURCE_USERNAME
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: username
```

**Environment-aware konfiguracija**  
Frontend uporablja dinamično detekcijo okolja:

```typescript
private apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api/auth'
  : '/api/auth';
```

### Database Management

**HikariCP connection pooling**  
Implementiran je connection pooling z omejitvami za preprečitev prekoračitve database connection limitov:

```properties
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=2
```

8 servisov × 5 connections = 40 aktivnih povezav (pod limitom 50 na Azure PostgreSQL).

---

## Arhitektura sistema

### Mikroservisi

| Servis | Port | Funkcionalnost | Baza |
|--------|------|----------------|------|
| **auth** | 8080 | Avtentikacija in avtorizacija | postgres |
| **clani** | 8080 | Upravljanje članov | postgres |
| **zaposleni** | 8080 | Upravljanje zaposlenih | postgres |
| **turnirji** | 8080 | Organizacija turnirjev (bracket sistem) | postgres3 |
| **igrisce** | 8080 | Rezervacijski sistem | postgres2 |
| **trenerstvo** | 8080 | Trenerske storitve | postgres2 |
| **shramba** | 8080 | Najem opreme | postgres2 |
| **fe** | 80 | Angular frontend (API Gateway) | - |

### Tehnološki stack

- **Backend**: Spring Boot 3.x, Java 17
- **Frontend**: Angular 21, NGINX
- **Database**: PostgreSQL 15 (Azure Flexible Server)
- **Container orchestration**: Kubernetes (Azure AKS)
- **Ingress**: NGINX Ingress Controller
- **SSL**: cert-manager z Let's Encrypt

### Komunikacijski tok

```
Internet
   ↓
NGINX Ingress Controller (LoadBalancer, HTTPS)
   ↓
Frontend Service (ClusterIP :80)
   ↓
NGINX Reverse Proxy
   ↓
Backend Services (ClusterIP :8080)
   ↓
Azure PostgreSQL
```

---

## Hosting

### Produkcijsko okolje

**Kubernetes Cluster**
- Provider: Azure Kubernetes Service (AKS)
- Cluster: `golfapp-aks`
- Lokacija: Italy North
- Namespace: `golfapp`
- Node pool: 2× Standard_B2s

**Baza podatkov**
- Provider: Azure Database for PostgreSQL Flexible Server
- Server: `golfapp.postgres.database.azure.com`
- Max connections: 50
- Databases: `postgres`, `postgres2`, `postgres3`

**Dostop**
- URL: https://golfapp.koncerti.live
- Ingress IP: 4.232.240.150
- SSL: Let's Encrypt (avtomatsko obnavljanje)

### Deployment

**Kreiranje secrets**
```bash
kubectl create secret generic db-credentials \
  --from-literal=username=<user> \
  --from-literal=password=<pass> \
  -n golfapp
```

**Deployment servisov**
```bash
kubectl apply -f <servis>/k8s-deployment.yaml
```

**Ingress in SSL**
```bash
kubectl apply -f fe/letsencrypt-issuer.yaml
kubectl apply -f fe/ingress.yaml
```

---

## Lokalni razvoj

### Backend servisi

```bash
cd <servis>
./mvnw clean package
java -jar target/*.jar
```

### Frontend

```bash
cd fe
npm install
ng serve
```

Aplikacija bo dostopna na `http://localhost:4200`.

---

## Docker build in publish

```bash
docker build -t willy161/<servis>:v1 .
docker push willy161/<servis>:v1
```

---

## Troubleshooting

**Preverjanje statusa**
```bash
kubectl get pods -n golfapp
kubectl get services -n golfapp
kubectl get ingress -n golfapp
```

**Pregled logov**
```bash
kubectl logs -n golfapp <pod-name>
kubectl logs -n golfapp -l app=<servis>
```

**SSL certifikat**
```bash
kubectl describe certificate golfapp-tls -n golfapp
```

**Testiranje database povezave**
```bash
psql -h golfapp.postgres.database.azure.com -U <user> -d <database>
```

---

## Status projekta

**Status**: Production Ready  
**Deployment**: Azure Kubernetes Service  
**HTTPS**: Enabled (Let's Encrypt)  
**Verzija**: 1.0

---

## Organizacija

**GitHub Organization**: prpo6  
**Repozitoriji**: auth, clani, zaposleni, turnirji, igrisce, trenerstvo, shramba, frontend

*Zadnja posodobitev: Januar 2026*

