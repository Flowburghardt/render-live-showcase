Schriften dieses PoC und ihre Lizenzen
======================================

Inter               SIL Open Font License 1.1  -> LICENSE-Inter.txt
                    The Inter Project Authors (github.com/rsms/inter)
                    Ueber @fontsource-variable/inter eingebunden (opsz.css:
                    Achsen opsz 14-32 + wght 100-900 in einer Datei), von Vite
                    gebundelt. Im PoC laeuft nur Gewicht 400 - die Hierarchie
                    entsteht allein ueber die Groesse.
                    Steht hier als STAND-IN fuer Aeonik Pro (kommerziell
                    lizenziert, bei Hyper Tria self-hosted). Die Aeonik-Dateien
                    sind nicht Teil dieses Repositoriums.

Die OFL verlangt, dass dieser Lizenztext mit den Schriftdateien zusammen
weitergegeben wird. Deshalb liegt er in public/ und nicht in src/assets/ -
Vite kopiert public/ unveraendert nach dist/, waehrend src/assets/ nur das
enthaelt, was auch importiert wird.
