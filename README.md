# 💻 FlipYourPC - https://flipyourpcs.com

FlipYourPC är en komplett webbaserad lösning för att hantera, bygga och sälja återbrukade datorer. Systemet erbjuder inventariehantering, PC-byggen, försäljningsstatus och exportfunktioner – skräddarsytt för PC-flipping!

## 🚀 Funktioner

- 🧩 **Komponenthantering**  
  Lägg till, redigera och ta bort komponenter i ditt lager.

- 🖥️ **PC-Byggare**  
  Bygg kompletta datorer med komponenter från ditt lager – en komponent per typ.

- 💼 **Försäljningsflöde**  
  Märk datorer som "Planering", "Till försäljning" eller "Såld", med försäljningsdatum.

- 📦 **Export till Excel**  
  Exportera både lager och PC-bygg till `.xlsx`-filer.

- 🧾 **Automatisk försäljningstext**  
  Generera färdig försäljningstext baserat på byggets innehåll.

- ☁️ **Cloudinary-bildhantering**  
  Ladda upp bilder till PC-byggen via Cloudinary.

  ## 🧑‍💻 Roller

- 👤 **Användare** – Hanterar sina egna komponenter och PC-byggen  
- 🛠️ **Admin** – Kan administrera användare, se historik och mer

## 🛠️ Teknisk översikt

## 🌐 Hosting

Applikationen är hostad i molnet via **Microsoft Azure**:

- 🟦 **Backend (API)**: Azure App Service  
- 🌐 **Frontend**: Azure Static Web Apps  
- 🗃️ **Databas**: Azure SQL Database  
- ☁️ **Cloudinary** används separat för bildlagring

All kommunikation sker via säkra HTTPS-anrop och tokenbaserad autentisering med JWT.

**Frontend**  
- React med Tailwind CSS  
- React Router DOM  
- Heroicons  
- Fetch API + JWT-autentisering  
- Responsiv design

**Backend**  
- ASP.NET Core Web API (.NET 9)  
- Entity Framework Core  
- Identity för användarhantering  
- ClosedXML för Excel-export  
- Cloudinary för bildlagring

**Databas**  
- Microsoft SQL Server (lokal eller Azure)

