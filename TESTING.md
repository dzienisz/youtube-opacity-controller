# Testing Checklist

Po zainstalowaniu/aktualizacji rozszerzenia, przetestuj następujące rzeczy:

## ✅ Podstawowa funkcjonalność

1. **Otwórz dowolny film YouTube**
   - Przykład: https://www.youtube.com/watch?v=YmcACIOQdDc

2. **Sprawdź czy rozszerzenie działa**
   - Czy kontrolki mają czarne tło?
   - Czy domyślnie opacity jest ustawione na 70%?

3. **Testuj slider**
   - Kliknij ikonę rozszerzenia
   - Przesuń slider od 0% do 100%
   - Czy zmiany są widoczne natychmiast?
   - Czy slider odpowiada płynnie?

## 🎯 Krytyczne elementy do sprawdzenia

### 1. Przycisk pełnego ekranu (Fullscreen button)
- ✅ Czy przycisk fullscreen jest widoczny?
- ✅ Czy przycisk ma prawidłowy rozmiar i pozycję?
- ✅ Czy ikona (4 strzałki) jest wyraźna?
- ✅ Czy przycisk działa po kliknięciu?
- ✅ Czy w trybie fullscreen kontrolki też mają czarne tło?

### 2. Czerwony scrubber (Progress bar dot)
- ✅ Czy czerwona kropka jest widoczna NA WIERZCHU czarnego tła?
- ✅ Czy możesz przesuwać scrubber bez problemów?
- ✅ Czy scrubber reaguje na hover (powiększa się)?
- ✅ Czy progress bar (czerwona linia) jest widoczna?

### 3. Inne przyciski
- ✅ Play/Pause - działa i jest widoczny?
- ✅ Volume - slider głośności działa?
- ✅ Settings (gear icon) - otwiera menu?
- ✅ Captions/Subtitles - przycisk działa?
- ✅ Quality settings - można zmienić jakość?

## 🎨 Różne poziomy opacity

Test z różnymi ustawieniami:

### 0% (Transparent)
- Powinno wyglądać jak oryginalny YouTube (przezroczyste)

### 25% (Light Gray)
- Lekkie ciemne tło
- Kontrolki bardziej widoczne niż przy 0%

### 50% (Medium Gray)
- Wyraźne ciemne tło
- Dobry balans widoczności

### 70% (Default)
- Mocne ciemne tło
- Wszystkie kontrolki bardzo wyraźne

### 100% (Solid Black)
- Kompletnie czarne, nieprzezroczyste tło
- Maksymalna widoczność kontrolek

## 🔧 Menu i popupy

1. **Settings menu**
   - Kliknij ikonkę zębatki (Settings)
   - Czy menu ma czarne tło?
   - Czy opcje są czytelne?

2. **Volume slider**
   - Hover nad ikoną głośnika
   - Czy slider głośności ma czarne tło?

3. **Quality menu**
   - Settings → Quality
   - Czy wszystkie opcje są widoczne?

4. **Speed menu**
   - Settings → Playback speed
   - Czy menu działa prawidłowo?

## 📱 Różne rozmiary okna

Testuj w różnych rozdzielczościach:
- ✅ Normalny rozmiar okna
- ✅ Okno zmaksymalizowane
- ✅ Małe okno (500px szerokości)
- ✅ Tryb teatru (Theater mode)
- ✅ Tryb pełnego ekranu (Fullscreen)

## 🔄 Nawigacja

1. **Zmiana filmu**
   - Przejdź do innego filmu
   - Czy rozszerzenie nadal działa?
   - Czy ustawienia są zachowane?

2. **Autoplay**
   - Pozwól filmowi się skończyć
   - Czy przy następnym filmie rozszerzenie działa?

## ❌ Co NIE powinno się zdarzyć

- ❌ Przyciski NIE powinny się "rozjechać" (zmienić pozycji)
- ❌ Scrubber NIE powinien zniknąć pod tłem
- ❌ Kontrolki NIE powinny przestać działać
- ❌ Layout playera NIE powinien się zepsuć
- ❌ Nic NIE powinno migać ani skakać

## 🐛 Jeśli coś nie działa

1. **Odśwież stronę** (F5 lub Cmd+R)
2. **Przeładuj rozszerzenie** w chrome://extensions/
3. **Sprawdź Console** (F12 → Console) czy są błędy
4. **Zgłoś bug** na GitHub z:
   - Opisem problemu
   - Link do filmu YouTube
   - Screenshot problemu
   - Jakie masz ustawienie opacity
   - Konsola (czy są błędy)

## ✨ Jeśli wszystko działa

Oznacza to że:
- Kod poprawnie modyfikuje style
- Nie nadpisuje krytycznych layoutów YouTube
- setProperty() działa lepiej niż cssText
- Z-index dla scrubbera jest prawidłowy

---

**Ostatnia aktualizacja:** Po poprawce z setProperty() zamiast cssText
