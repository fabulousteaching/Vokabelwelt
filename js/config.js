/* Vokabelwelt: Verbindung zu Supabase (Anmeldung und gespeicherte Vokabelportionen)

   Beide Werte stehen in Supabase beim Projekt unter «Connect» oder «Project Settings → API Keys».
   Sie dürfen öffentlich sein: Die Daten schützen die Zugriffsregeln aus supabase/vokabelwelt.sql,
   dort sieht jede Person nur ihre eigenen Portionen.
   Den «secret» bzw. «service_role» Schlüssel nie hier eintragen.

   Bleiben die Werte leer, läuft Vokabelwelt ohne Anmeldung, alles bleibt nur im Browser.

   loginDomain: Aus dem Benutzernamen „anna“ wird intern die Adresse vokabelwelt.anna@<loginDomain>.
   Dorthin wird nie etwas geschickt. Nach dem ersten Konto nicht mehr ändern, sonst passen die Logins nicht mehr. */
window.VOKABELWELT_CONFIG = {
  supabaseUrl: '',   // z. B. 'https://abcdefghijkl.supabase.co'
  supabaseKey: '',   // «Publishable key» (sb_publishable_…) oder «anon public», darf öffentlich sein
  loginDomain: 'smartslots.ch',
};
