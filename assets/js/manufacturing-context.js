(function (scope) {
  'use strict';
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const copy = {
    en: {heading:'Custom Wire Harness Manufacturing in China',start:'Start with the information you have',intro:'A sample, clear connector photos or a description of the equipment and required quantity is enough to start a review.',details:'Information for an accurate quotation',inputs:'When available, include drawings and BOM, connector and mating part numbers, pinout, wire length and gauge, branch layout, quantity and required tests. Materials, inspection scope and delivery are confirmed for each project.',quote:'Send a harness requirement',manufacturing:'Custom harness manufacturing',engineering:'Engineering review and production process',validation:'Prototype and sample validation',factory:'Factory and inspection workflow'},
    zh: {heading:'中国工厂 · 定制线束制造与 OEM/ODM',start:'先提供您现有的资料',intro:'没有完整图纸也可以先提供样品、清晰的接头照片，或说明目标设备、用途和所需数量，开始需求审核。',details:'准确报价需要哪些资料',inputs:'如有，请提供图纸与 BOM、连接器及对插件料号、pinout、长度与线规、分支布局、数量和测试要求。材料、检验范围和交付安排按具体项目确认。',quote:'提交线束需求',manufacturing:'定制线束制造',engineering:'工程审核与生产流程',validation:'打样与样品验证',factory:'工厂与检验流程'}
  };
  const labels = {
    hi:['कस्टम वायर हार्नेस निर्माण','आपके पास जो जानकारी है उससे शुरू करें','सटीक कोटेशन के लिए जानकारी','हार्नेस की आवश्यकता भेजें'],
    es:['Fabricación de arneses a medida en China','Empiece con la información disponible','Información para un presupuesto preciso','Enviar requisitos del arnés'],
    fr:['Fabrication de faisceaux sur mesure en Chine','Commencez avec les informations disponibles','Informations pour un devis précis','Envoyer les besoins du faisceau'],
    ar:['تصنيع ضفائر الأسلاك المخصصة في الصين','ابدأ بالمعلومات المتاحة لديك','معلومات لعرض سعر دقيق','أرسل متطلبات ضفيرة الأسلاك'],
    bn:['চীনে কাস্টম তারের হারনেস তৈরি','আপনার কাছে থাকা তথ্য দিয়ে শুরু করুন','সঠিক মূল্য প্রস্তাবের তথ্য','হারনেসের চাহিদা পাঠান'],
    pt:['Fabricação de chicotes personalizados na China','Comece com as informações disponíveis','Informações para uma cotação precisa','Enviar requisitos do chicote'],
    ru:['Изготовление жгутов на заказ в Китае','Начните с имеющейся информации','Данные для точного расчёта','Отправить требования к жгуту'],
    ur:['چین میں حسب ضرورت وائر ہارنس کی تیاری','اپنے پاس موجود معلومات سے شروع کریں','درست قیمت کے لیے معلومات','ہارنس کی ضروریات بھیجیں'],
    id:['Pembuatan wiring harness khusus di Tiongkok','Mulai dengan informasi yang tersedia','Informasi untuk penawaran akurat','Kirim kebutuhan harness'],
    de:['Kabelbaumfertigung nach Maß in China','Beginnen Sie mit den vorhandenen Informationen','Angaben für ein genaues Angebot','Kabelbaumanforderungen senden'],
    ja:['中国でのカスタムワイヤーハーネス製造','お手元の情報からご相談ください','正確なお見積りに必要な情報','ハーネスの要件を送る'],
    tr:['Çin’de özel kablo demeti üretimi','Elinizdeki bilgilerle başlayın','Doğru teklif için bilgiler','Kablo demeti gereksinimlerini gönderin'],
    vi:['Sản xuất dây điện tùy chỉnh tại Trung Quốc','Bắt đầu với thông tin bạn có','Thông tin để báo giá chính xác','Gửi yêu cầu dây điện'],
    ko:['중국 맞춤형 와이어 하네스 제조','보유하신 정보로 시작하세요','정확한 견적에 필요한 정보','하네스 요구 사항 보내기'],
    it:['Produzione di cablaggi su misura in Cina','Iniziate con le informazioni disponibili','Informazioni per un preventivo preciso','Invia i requisiti del cablaggio'],
    nl:['Kabelbomen op maat uit China','Begin met de beschikbare informatie','Informatie voor een nauwkeurige offerte','Kabelboomvereisten versturen'],
    pl:['Produkcja wiązek na zamówienie w Chinach','Zacznij od dostępnych informacji','Dane do dokładnej wyceny','Wyślij wymagania wiązki'],
    th:['การผลิตชุดสายไฟตามสั่งในจีน','เริ่มจากข้อมูลที่คุณมี','ข้อมูลสำหรับใบเสนอราคาที่แม่นยำ','ส่งความต้องการชุดสายไฟ']
  };
  const starting = {
    hi:'समीक्षा शुरू करने के लिए नमूना, स्पष्ट कनेक्टर फ़ोटो या उपकरण, उपयोग और मात्रा का विवरण भेजें।',
    es:'Envíe una muestra, fotos claras de los conectores o una descripción del equipo, uso y cantidad para iniciar la revisión.',
    fr:'Envoyez un échantillon, des photos nettes des connecteurs ou une description de l’équipement, de l’usage et de la quantité.',
    ar:'أرسل عينة أو صورًا واضحة للموصلات أو وصفًا للمعدات والاستخدام والكمية لبدء المراجعة.',
    bn:'পর্যালোচনা শুরু করতে নমুনা, স্পষ্ট সংযোগকারীর ছবি বা যন্ত্র, ব্যবহার ও পরিমাণের বিবরণ পাঠান।',
    pt:'Envie uma amostra, fotos claras dos conectores ou uma descrição do equipamento, uso e quantidade para iniciar a análise.',
    ru:'Для начала проверки отправьте образец, чёткие фото разъёмов или описание оборудования, назначения и количества.',
    ur:'جائزہ شروع کرنے کے لیے نمونہ، کنیکٹر کی واضح تصاویر یا آلات، استعمال اور مقدار کی تفصیل بھیجیں۔',
    id:'Kirim sampel, foto konektor yang jelas atau keterangan peralatan, penggunaan dan jumlah untuk memulai peninjauan.',
    de:'Senden Sie ein Muster, klare Steckerfotos oder Angaben zu Gerät, Anwendung und Menge für die erste Prüfung.',
    ja:'サンプル、鮮明なコネクター写真、または装置・用途・数量の説明から確認を始められます。',
    tr:'İncelemeye başlamak için numune, net konnektör fotoğrafları veya ekipman, kullanım ve miktar bilgisi gönderin.',
    vi:'Gửi mẫu, ảnh đầu nối rõ nét hoặc mô tả thiết bị, mục đích sử dụng và số lượng để bắt đầu đánh giá.',
    ko:'샘플, 선명한 커넥터 사진 또는 장비, 용도와 수량 설명으로 검토를 시작할 수 있습니다.',
    it:'Invia un campione, foto chiare dei connettori o una descrizione dell’apparecchiatura, dell’uso e della quantità.',
    nl:'Stuur een monster, duidelijke connectorfoto’s of een beschrijving van apparatuur, toepassing en aantal voor de eerste beoordeling.',
    pl:'Wyślij próbkę, wyraźne zdjęcia złączy lub opis urządzenia, zastosowania i ilości, aby rozpocząć ocenę.',
    th:'ส่งตัวอย่าง ภาพขั้วต่อที่ชัดเจน หรือคำอธิบายอุปกรณ์ การใช้งาน และจำนวนเพื่อเริ่มการตรวจสอบ'
  };
  const inputs = {
    hi:'उपलब्ध होने पर ड्रॉइंग, BOM, कनेक्टर और मेटिंग पार्ट नंबर, pinout, लंबाई, वायर गेज, शाखाएँ, मात्रा और परीक्षण भेजें। सामग्री, निरीक्षण और डिलीवरी परियोजना के अनुसार तय होते हैं।',
    es:'Si dispone de ellos, incluya planos, BOM, referencias de conectores y piezas acopladas, pinout, longitud, calibre, ramales, cantidad y pruebas. Materiales, inspección y entrega se acuerdan por proyecto.',
    fr:'Si disponibles, joignez plans, BOM, références des connecteurs et pièces associées, pinout, longueur, section, branches, quantité et essais. Matériaux, inspection et livraison sont définis par projet.',
    ar:'عند توفرها، أرفق الرسومات وBOM وأرقام الموصلات والأجزاء المقابلة وpinout والطول ومقاس السلك والفروع والكمية والاختبارات. تُحدد المواد والفحص والتسليم لكل مشروع.',
    bn:'থাকলে অঙ্কন, BOM, সংযোগকারী ও মিলিত অংশের নম্বর, pinout, দৈর্ঘ্য, তারের গেজ, শাখা, পরিমাণ ও পরীক্ষা দিন। উপকরণ, পরীক্ষা ও সরবরাহ প্রকল্পভিত্তিক নিশ্চিত করা হয়।',
    pt:'Se disponíveis, inclua desenhos, BOM, códigos de conectores e peças correspondentes, pinout, comprimento, bitola, ramificações, quantidade e testes. Materiais, inspeção e entrega são definidos por projeto.',
    ru:'При наличии приложите чертежи, BOM, номера разъёмов и ответных частей, pinout, длины, сечение, ветви, количество и испытания. Материалы, контроль и поставка согласуются по проекту.',
    ur:'دستیاب ہوں تو ڈرائنگ، BOM، کنیکٹر اور مقابل پرزے کے نمبر، pinout، لمبائی، تار کا گیج، شاخیں، مقدار اور ٹیسٹ دیں۔ مواد، معائنہ اور ترسیل منصوبے کے مطابق طے ہوتے ہیں۔',
    id:'Jika tersedia, sertakan gambar, BOM, nomor konektor dan pasangan, pinout, panjang, ukuran kawat, cabang, jumlah dan pengujian. Bahan, pemeriksaan dan pengiriman dikonfirmasi per proyek.',
    de:'Falls vorhanden: Zeichnungen, BOM, Stecker- und Gegensteckernummern, Pinbelegung, Länge, Querschnitt, Abzweige, Menge und Prüfungen. Material, Prüfung und Lieferung werden je Projekt bestätigt.',
    ja:'図面、BOM、コネクターと対向部品の品番、pinout、長さ、線径、分岐、数量、試験条件があれば添付してください。材料、検査範囲、納期は案件ごとに確認します。',
    tr:'Varsa çizim, BOM, konnektör ve eş parçanın numarası, pinout, uzunluk, tel kesiti, dallar, miktar ve testleri ekleyin. Malzeme, muayene ve teslimat projeye göre onaylanır.',
    vi:'Nếu có, cung cấp bản vẽ, BOM, mã đầu nối và phần ghép, pinout, chiều dài, cỡ dây, nhánh, số lượng và thử nghiệm. Vật liệu, kiểm tra và giao hàng được xác nhận theo dự án.',
    ko:'도면, BOM, 커넥터 및 결합 부품 번호, pinout, 길이, 전선 규격, 분기, 수량과 시험 조건이 있으면 첨부해 주세요. 자재, 검사 범위와 납기는 프로젝트별로 확인합니다.',
    it:'Se disponibili, includi disegni, BOM, codici di connettori e parti accoppiate, pinout, lunghezza, sezione, diramazioni, quantità e prove. Materiali, controlli e consegna sono definiti per progetto.',
    nl:'Voeg indien beschikbaar tekeningen, BOM, connector- en tegenstekkerreferenties, pinout, lengte, draaddikte, aftakkingen, aantal en tests toe. Materiaal, inspectie en levering worden per project bevestigd.',
    pl:'Jeśli dostępne, dołącz rysunki, BOM, numery złączy i części współpracujących, pinout, długość, przekrój, odgałęzienia, ilość i testy. Materiały, kontrola i dostawa są ustalane dla projektu.',
    th:'ถ้ามี โปรดแนบแบบ BOM หมายเลขขั้วต่อและชิ้นส่วนคู่ pinout ความยาว ขนาดสาย กิ่งสาย จำนวน และการทดสอบ วัสดุ การตรวจสอบ และการส่งมอบจะยืนยันตามโครงการ'
  };
  const specific = {
    '/products/molex-compatible': {en:'For a Molex-compatible assembly, include the connector series and exact mating part, pitch, circuit count, terminal choice and wire size. Compatibility is reviewed against the specified interface.',zh:'Molex 兼容线束请补充系列、准确对插件料号、间距、回路数、端子与线径；兼容性依据指定接口审核。'},
    '/products/automotive-diagnostic-and-obd-harness': {en:'For an OBD harness, identify the vehicle and tool interfaces, pin mapping, straight or branched layout, cable length and intended diagnostic task.',zh:'OBD 线束请说明车端与工具端接口、针脚对应、直连或分支布局、线长与目标诊断任务。'},
    '/obd2-diagnostic-cable': {en:'For an OBD2 cable, identify the vehicle and tool interfaces, pin mapping, straight or branched layout, cable length and intended diagnostic task.',zh:'OBD2 诊断线请说明车端与工具端接口、针脚对应、直连或分支布局、线长与目标诊断任务。'},
    '/products/equipment-wire': {en:'For equipment wiring, include current and voltage, wire gauge, termination, routing space, temperature or movement conditions and the required inspection scope.',zh:'设备连接线请补充电流与电压、线规、端接方式、布线空间、温度或运动条件，以及需要确认的检验范围。'}
  };
  function render(options) {
    const {path, lang='en', procurementContext='', categoryKey='', productId=''} = options;
    const c = copy[lang] || {...copy.en,heading:labels[lang]?.[0] || copy.en.heading,start:labels[lang]?.[1] || copy.en.start,details:labels[lang]?.[2] || copy.en.details,quote:labels[lang]?.[3] || copy.en.quote,intro:starting[lang] || copy.en.intro,inputs:inputs[lang] || copy.en.inputs};
    const query = new URLSearchParams({source_page:path});
    if(categoryKey) query.set('category',categoryKey);
    if(productId) query.set('products',productId);
    const context = specific[path]?.[lang] || '';
    const links = lang==='en' || lang==='zh' ? `<nav class="mc-links" aria-label="${esc(c.manufacturing)}"><a href="/custom-wiring-harness">${esc(c.manufacturing)}</a><a href="/custom">${esc(c.engineering)}</a><a href="/custom#cu-process-title">${esc(c.validation)}</a><a href="/about">${esc(c.factory)}</a></nav>` : '';
    return `<section class="manufacturing-context" id="manufacturing-context" aria-labelledby="mc-heading"><div class="mc-inner"><div class="mc-business"><h2 id="mc-heading">${esc(c.heading)}</h2><p>${esc(procurementContext)}</p>${links}</div><div class="mc-inquiry"><h3>${esc(c.start)}</h3><p>${esc(c.intro)}</p>${context?`<p class="mc-topic">${esc(context)}</p>`:''}<details><summary>${esc(c.details)}</summary><p>${esc(c.inputs)}</p></details><a class="mc-quote" href="/contact?${esc(query.toString())}">${esc(c.quote)} <span aria-hidden="true">→</span></a></div></div></section>`;
  }
  function apply(options) {
    if(!scope.document || !options) return;
    const current = scope.document.getElementById('manufacturing-context');
    const markup = render(options);
    if(current) current.outerHTML=markup;
    else scope.document.querySelector('footer.footer')?.insertAdjacentHTML('beforebegin',markup);
  }
  scope.SS_MANUFACTURING_CONTEXT={render,apply};
})(typeof window==='undefined'?globalThis:window);
