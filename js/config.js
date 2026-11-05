/* Vokabelwelt: Verbindung zu Supabase (Anmeldung mit E-Mail-Adresse und gespeicherte Vokabelportionen)

   Beide Werte stehen in Supabase beim Projekt unter «Connect» oder «Project Settings → API Keys».
   Sie dürfen öffentlich sein: Die Daten schützen die Zugriffsregeln aus supabase/vokabelwelt.sql,
   dort sieht jede Person nur ihre eigenen Portionen.
   Den «secret» bzw. «service_role» Schlüssel nie hier eintragen.

   Bleiben die Werte leer, läuft Vokabelwelt ohne Anmeldung, alles bleibt nur im Browser. */
window.VOKABELWELT_CONFIG = {
  supabaseUrl: 'https://cppgdrwpwcshtbavesrm.supabase.co',
  supabaseKey: 'sb_publishable_66QwDLf_H_O1aNdn2mP1LA_A40he3mM',   // «Publishable key», darf öffentlich sein
};
