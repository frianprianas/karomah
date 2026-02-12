
export interface Hadith {
    day: number;
    arabic: string;
    translation: string;
    narrator: string;
}

export const RAMADAN_HADITHS: Hadith[] = [
    {
        day: 1,
        arabic: "إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ وَغُلِّقَتْ أَبْوَابُ النَّارِ وَصُفِّدَتِ الشَّيَاطِينُ",
        translation: "Apabila datang bulan Ramadan, maka pintu-pintu surga dibuka, pintu-pintu neraka ditutup, dan syaitan-syaitan dibelenggu.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 2,
        arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
        translation: "Barangsiapa berpuasa Ramadan atas dasar iman dan mengharap pahala dari Allah, maka dosanya yang telah lalu akan diampuni.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 3,
        arabic: "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً",
        translation: "Makan sahurlah kalian, karena sesungguhnya dalam sahur itu terdapat keberkahan.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 4,
        arabic: "الصِّيَAMُ جُنَّةٌ فَإِذَا كَانَ يَوْمُ صَوْمِ أَحَدِكُمْ فَلَا يَرْفُثْ وَلَا يَصْخَبْ",
        translation: "Puasa adalah perisai. Maka apabila seseorang dari kalian sedang berpuasa, janganlah berkata kotor dan janganlah bertengkar.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 5,
        arabic: "رُبَّ صَائِمٍ لَيْسَ لَهُ مِنْ صِيَامِهِ إِلَّا الْجُوعُ وَالْعَطَشُ",
        translation: "Betapa banyak orang yang berpuasa namun tidak mendapatkan apa-apa dari puasanya selain lapar dan dahaga.",
        narrator: "HR. Ahmad"
    },
    {
        day: 6,
        arabic: "عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
        translation: "Hendaklah kalian berlaku jujur, karena kejujuran menuntun kepada kebaikan, dan kebaikan menuntun kepada surga.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 7,
        arabic: "أَفْضَلُ الصَّدَقَةِ صَدَقَةٌ فِي رَمَضَانَ",
        translation: "Sedekah yang paling utama adalah sedekah di bulan Ramadan.",
        narrator: "HR. Tirmidzi"
    },
    {
        day: 8,
        arabic: "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
        translation: "Barangsiapa mendirikan salat (Tarawih) pada bulan Ramadan karena iman dan mengharap pahala, diampuni dosa-dosanya yang telah lalu.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 9,
        arabic: "فَإِنَّ عُمْرَةً فِي رَمَضَانَ تَقْضِي حَجَّةً مَعِي",
        translation: "Sesungguhnya umrah di bulan Ramadan pahalanya menyamai ibadah haji bersamaku.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 10,
        arabic: "لَخُلُوفُ فَمِ الصَّائِمِ أَطْيَبُ عِنْدَ اللَّهِ مِنْ رِيحِ الْمِسْكِ",
        translation: "Sungguh, bau mulut orang yang berpuasa lebih harum di sisi Allah daripada aroma minyak kasturi.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 11,
        arabic: "مَنْ فَطَّرَ صَائِمًا كَانَ لَهُ مِثْلُ أَجْرِهِ غَيْرَ أَنَّهُ لاَ يَنْقُصُ مِنْ أَجْرِ الصَّائِمِ شَيْئًا",
        translation: "Barangsiapa memberi hidangan berbuka puasa kepada orang yang berpuasa, maka ia akan mendapatkan pahala seperti orang tersebut tanpa mengurangi pahalanya sedikitpun.",
        narrator: "HR. Tirmidzi"
    },
    {
        day: 12,
        arabic: "الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ وَرَمَضَانُ إِلَى رَمَضَانَ مُكَفِّرَاتٌ مَا بَيْنَهُنَّ إِذَا اجْتَنَبَ الْكَبَائِرَ",
        translation: "Antara shalat lima waktu, antara Jumat yang satu dan Jumat berikutnya, antara Ramadan yang satu dan Ramadan berikutnya, di antara amalan-amalan tersebut adalah penggugur dosa selama menjauhi dosa besar.",
        narrator: "HR. Muslim"
    },
    {
        day: 13,
        arabic: "إِنَّ فِي الْجَنَّةِ بَابًا يُقَالُ لَهُ الرَّيَّانُ يَدْخُلُ مِنْهُ الصَّائِمُونَ يَوْمَ الْقِيَامَةِ",
        translation: "Sesungguhnya di surga ada satu pintu yang disebut Ar-Rayyan, orang-orang yang berpuasa akan masuk melaluinya pada hari kiamat.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 14,
        arabic: "أَكْثَرُ مَا يُدْخِلُ النَّاسَ الْجَنَّةَ تَقْوَى اللَّهِ وَحُسْنُ الْخُلُقِ",
        translation: "Amalan yang paling banyak memasukkan manusia ke dalam surga adalah takwa kepada Allah dan akhlak yang mulia.",
        narrator: "HR. Tirmidzi"
    },
    {
        day: 15,
        arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
        translation: "Sebaik-baik kalian adalah orang yang mempelajari Al-Qur'an dan mengajarkannya.",
        narrator: "HR. Bukhari"
    },
    {
        day: 16,
        arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
        translation: "Doa adalah inti dari ibadah.",
        narrator: "HR. Tirmidzi"
    },
    {
        day: 17,
        arabic: "مَنْ كَفَّ غَضَبَهُ سَتَرَ اللهُ عَوْرَتَهُ",
        translation: "Barangsiapa menahan amarahnya, niscaya Allah akan menutupi aibnya.",
        narrator: "HR. Thabrani"
    },
    {
        day: 18,
        arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
        translation: "Bertakwalah kepada Allah di mana saja kamu berada, iringilah keburukan dengan kebaikan niscaya kebaikan itu akan menghapusnya, dan pergaulilah manusia dengan akhlak yang baik.",
        narrator: "HR. Tirmidzi"
    },
    {
        day: 19,
        arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
        translation: "Perkataan yang baik adalah sedekah.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 20,
        arabic: "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْوِتْرِ مِنَ الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ",
        translation: "Carilah Lailatul Qadar pada malam ganjil di sepuluh hari terakhir bulan Ramadan.",
        narrator: "HR. Bukhari"
    },
    {
        day: 21,
        arabic: "مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
        translation: "Barangsiapa menghidupkan Lailatul Qadar dengan iman dan mengharap pahala, maka dosanya yang lalu akan diampuni.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 22,
        arabic: "كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم أَجْوَدَ النَّاسِ وَكَانَ أَجْوَدُ مَا يَكُونُ فِي رَمَضَانَ",
        translation: "Rasulullah itu adalah orang yang paling dermawan, dan beliau lebih dermawan lagi di bulan Ramadan.",
        narrator: "HR. Bukhari"
    },
    {
        day: 23,
        arabic: "الصِّيَامُ وَالْقُرْآنُ يَشْفَعَانِ لِلْعَبْدِ يَوْمَ الْقِيَامَةِ",
        translation: "Puasa dan Al-Qur'an akan memberikan syafaat bagi seorang hamba di hari kiamat.",
        narrator: "HR. Ahmad"
    },
    {
        day: 24,
        arabic: "لَا يَحِلُّ لِمُسْلِمٍ أَنْ يَهْجُرَ أَخَاهُ فَوْقَ ثَلَاثِ لَيَالٍ",
        translation: "Tidak halal bagi seorang muslim mendiamkan saudaranya lebih dari tiga hari.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 25,
        arabic: "مَنْ لاَ يَرْحَمِ النَّاسَ لاَ يَرْحَمْهُ اللَّهُ",
        translation: "Barangsiapa tidak menyayangi manusia, maka Allah tidak akan menyayanginya.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 26,
        arabic: "تَهَادَوْا تَحَابُّوا",
        translation: "Saling memberi hadiahlah kalian, niscaya kalian akan saling mencintai.",
        narrator: "HR. Bukhari"
    },
    {
        day: 27,
        arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
        translation: "Amalan yang paling dicintai Allah adalah yang paling istiqomah (rutin) meskipun sedikit.",
        narrator: "HR. Bukhari & Muslim"
    },
    {
        day: 28,
        arabic: "البِرُّ حُسْنُ الخُلُقِ وَالإِثْمُ مَا حَاكَ فِي صَدْرِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ",
        translation: "Kebajikan adalah akhlak yang baik, sedangkan dosa adalah apa yang menggelisahkan di hatimu dan kamu benci jika diketahui orang lain.",
        narrator: "HR. Muslim"
    },
    {
        day: 29,
        arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ",
        translation: "Setiap kebaikan adalah sedekah.",
        narrator: "HR. Bukhari"
    },
    {
        day: 30,
        arabic: "مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ",
        translation: "Barangsiapa berpuasa Ramadan kemudian mengiringinya dengan enam hari di bulan Syawal, seolah-olah ia berpuasa setahun penuh.",
        narrator: "HR. Muslim"
    }
];
