Schriften dieses PoC und ihre Lizenzen
======================================

Familie             Lizenz                     Datei
-------             ------                     -----
Fraunces            SIL Open Font License 1.1  -> LICENSE-Fraunces.txt
                    The Fraunces Project Authors (github.com/undercasetype/Fraunces)
                    Ueber @fontsource-variable/fraunces eingebunden (full.css:
                    Achsen opsz, wght, SOFT, WONK in einer Datei), von Vite
                    gebundelt. Im PoC laeuft nur Gewicht 400, gezaehmt per
                    font-variation-settings 'opsz' 36, 'SOFT' 0, 'WONK' 0.
                    Steht hier als STAND-IN fuer Untitled Serif (Klim Type
                    Foundry, kommerziell lizenziert).

DM Mono             SIL Open Font License 1.1  -> LICENSE-DMMono.txt
                    The DM Mono Project Authors (github.com/googlefonts/dm-mono)
                    Ueber @fontsource/dm-mono eingebunden (400.css + 500.css),
                    von Vite gebundelt. 400 = Fliesstext/UI, 500 = Pill-Buttons
                    und Marker-Labels.
                    Steht hier als STAND-IN fuer ABC Diatype Mono (Dinamo,
                    kommerziell lizenziert).

Die Originalschriften (Untitled Serif, ABC Diatype Mono) sind nicht Teil dieses
Repositoriums.

Die OFL verlangt, dass dieser Lizenztext mit den Schriftdateien zusammen
weitergegeben wird. Deshalb liegen die Texte in public/ und nicht in src/assets/ -
Vite kopiert public/ unveraendert nach dist/, waehrend src/assets/ nur das
enthaelt, was auch importiert wird.
