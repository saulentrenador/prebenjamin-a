import os
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

# Configuración de URLs y Parámetros de la FEXF
COD_COMPETICION = "22998153"
COD_GRUPO = "23249772"
COD_TEMPORADA = "22"
DELEGACION = "1"

DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

def obtener_jornada_activa():
    """Lee la jornada activa desde config.js si existe, por defecto 1."""
    if os.path.exists("config.js"):
        with open("config.js", "r", encoding="utf-8") as f:
            content = f.read()
            match = re.search(r'jornadaActiva\s*:\s*(\d+)', content)
            if match:
                return int(match.group(1))
    return 1

def normalizar_nombre(texto):
    """Limpia puntos, comillas y espacios redundantes."""
    if not texto:
        return ""
    t = texto.upper().replace(".", "").replace('"', '').replace("'", "").replace("«", "").replace("»", "")
    return " ".join(t.split())

def es_mi_equipo(nombre_celda):
    """Comprueba coincidencia exacta con C.D. DON BENITO A."""
    norm = normalizar_nombre(nombre_celda)
    return norm == "CD DON BENITO A"

def mapear_lugar(es_local, info_extra):
    """
    Mapea el campo según se juegue como Local o Visitante.
    """
    info_lower = info_extra.lower() if info_extra else ""
    
    if es_local:
        if "verde" in info_lower:
            return "pistaVerdeDonBenito"
        elif "pabellon" in info_lower or "pabellón" in info_lower:
            return "pabellonDonBenito"
        else:
            # "pista exterior", "azul" o por defecto local
            return "pistaAzulDonBenito"
    else:
        # Campos de los equipos rivales (ampliable)
        if "jaula" in info_lower or "vva" in info_lower or "villanueva" in info_lower or "cesped" in info_lower or "césped" in info_lower:
            return "jaulaVva"
        elif "miajadas" in info_lower:
            return "pabellonMiajadas"
        elif "valdivia" in info_lower:
            return "pabellonValdivia"
        elif "santa amalia" in info_lower or "sta" in info_lower:
            return "pabellonSantaAmalia"
        return "pabellonDonBenito"

def determinar_estado_y_fecha(fecha_str, hora_str):
    """
    Calcula el estadoFecha ('provisional', 'pendiente', 'confirmada')
    y devuelve las fechas formateadas.
    """
    # CASO 1: Si NO hay hora o fecha aún confirmada en la FEXF -> PROVISIONAL
    if not fecha_str or not hora_str:
        if fecha_str:
            try:
                partes = fecha_str.replace('/', '-').split('-')
                dia, mes, anio = int(partes[0]), int(partes[1]), int(partes[2])
                dt = datetime(anio, mes, dia)
                # Calcular el Viernes y Sábado de ese fin de semana
                viernes_dt = dt - timedelta(days=(dt.weekday() - 4)) if dt.weekday() != 4 else dt
                sabado_dt = viernes_dt + timedelta(days=1)
                
                mes_nombre = MESES[viernes_dt.month - 1]
                fecha_bonita = f"{viernes_dt.day} ó {sabado_dt.day} de {mes_nombre} de {viernes_dt.year}"
                fecha_iso = f"{viernes_dt.year:04d}-{viernes_dt.month:02d}-{viernes_dt.day:02d}"
                return 'provisional', fecha_bonita, fecha_iso
            except Exception:
                pass
        return 'provisional', 'Fecha por definir', ''

    # CASO 2: Sí hay fecha y hora exactas
    partes = fecha_str.replace('/', '-').split('-')
    dia, mes, anio = int(partes[0]), int(partes[1]), int(partes[2])
    dt = datetime(anio, mes, dia)

    dia_nombre = DIAS_SEMANA[dt.weekday()]
    mes_nombre = MESES[dt.month - 1]
    fecha_bonita = f"{dia_nombre}, {dt.day} de {mes_nombre} de {dt.year}"
    fecha_iso = f"{dt.year:04d}-{dt.month:02d}-{dt.day:02d}"

    # Calcular el Miércoles de esa misma semana a las 15:30
    lunes_semana = dt - timedelta(days=dt.weekday())
    miercoles_1530 = datetime(lunes_semana.year, lunes_semana.month, lunes_semana.day, 15, 30)

    ahora = datetime.now()

    # Si ya hemos pasado el Miércoles a las 15:30 de la semana del partido -> CONFIRMADA
    if ahora >= miercoles_1530:
        estado = 'confirmada'
    else:
        # Si ya se sabe la fecha y hora pero aún es antes del miércoles 15:30 -> PENDIENTE
        estado = 'pendiente'

    return estado, fecha_bonita, fecha_iso

def scrapear_fexf(jornada):
    url = f"https://www.fexfutbol.com/pnfg/NPcd/NFG_CmpJornada?cod_primaria=1000120&CodCompeticion={COD_COMPETICION}&CodGrupo={COD_GRUPO}&CodTemporada={COD_TEMPORADA}&CodJornada={jornada}&Sch_Codigo_Delegacion={DELEGACION}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error al conectar con la FEXF: Status {response.status_code}")
            return None

        soup = BeautifulSoup(response.text, 'html.parser')
        filas = soup.find_all('tr')

        for fila in filas:
            celdas = fila.find_all('td')
            if len(celdas) >= 3:
                local_raw = celdas[0].get_text(strip=True)
                visitante_raw = celdas[2].get_text(strip=True)

                es_local = es_mi_equipo(local_raw)
                es_visitante = es_mi_equipo(visitante_raw)

                if es_local or es_visitante:
                    rival = visitante_raw if es_local else local_raw
                    texto_completo = fila.get_text(" ", strip=True)
                    
                    fecha_match = re.search(r'(\d{2}[-/]\d{2}[-/]\d{4})', texto_completo)
                    hora_match = re.search(r'(\d{1,2}:\d{2})', texto_completo)
                    
                    fecha_raw = fecha_match.group(1) if fecha_match else ""
                    hora_str = hora_match.group(1) if hora_match else ""

                    estado, fecha_bonita, fecha_iso = determinar_estado_y_fecha(fecha_raw, hora_str)
                    lugar_key = mapear_lugar(es_local, texto_completo)

                    return {
                        "jornada": f"{jornada}ª JORNADA · GRUPO 6",
                        "competicion": "",
                        "esLocal": es_local,
                        "rival": rival,
                        "fecha": fecha_bonita,
                        "fechaISO": fecha_iso,
                        "horaPartido": hora_str,
                        "estadoFecha": estado,
                        "lugarKey": lugar_key
                    }

    except Exception as e:
        print(f"Error en la extracción: {e}")
        return None
    return None

def generar_archivo_jornada(datos, jornada):
    if not datos:
        print(f"⚠️ No se pudo encontrar el partido en la Jornada {jornada}.")
        return

    os.makedirs("jornadas", exist_ok=True)
    filepath = f"jornadas/jornada_prueba{jornada}.js"

    contenido_js = f"""const CONVOCATORIA_SEMANAL = {{
  jornada: '{datos['jornada']}',
  competicion: '{datos['competicion']}', // Primera División Prebenjamín Sala
  rival: '{datos['rival']}',
  esLocal: {str(datos['esLocal']).lower()}, // true = Local | false = Visitante
  
  fecha: '{datos['fecha']}',
  fechaISO: '{datos['fechaISO']}',
  estadoFecha: '{datos['estadoFecha']}', // 'provisional', 'pendiente', 'confirmada' o 'modificada'
  
  horaPartido: '{datos['horaPartido']}',
  minutosAntelacion: 20,
  notasCitacion: '',
  
  lugarKey: '{datos['lugarKey']}',
  equipacionSeleccionada: {1 if datos['esLocal'] else 2}
}};
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(contenido_js)
    
    print(f"✅ Archivo {filepath} generado con éxito con estado '{datos['estadoFecha']}'.")

if __name__ == "__main__":
    jornada_activa = obtener_jornada_activa()
    print(f"Consultando FEXF para la Jornada {jornada_activa}...")
    datos_partido = scrapear_fexf(jornada_activa)
    generar_archivo_jornada(datos_partido, jornada_activa)