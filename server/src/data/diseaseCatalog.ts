export type DiseaseInfo = {
  crop: string
  disease: string
  scientificName: string
  severity: 'Low' | 'Moderate' | 'High'
  symptoms: string[]
  actions: string[]
  prevention: string[]
}

export const diseaseCatalog: Record<string, DiseaseInfo> = {
  'Apple___Apple_scab': {
    crop: 'Apple',
    disease: 'Apple Scab',
    scientificName: 'Venturia inaequalis',
    severity: 'Moderate',
    symptoms: [
      'Olive-green to black velvety spots on leaves',
      'Distorted or curled leaves',
      'Crusty, scabby lesions on fruit'
    ],
    actions: [
      'Remove and destroy fallen leaves to reduce overwintering spores.',
      'Prune dense canopies to improve air circulation.',
      'Apply targeted protective fungicide during damp spring conditions.'
    ],
    prevention: [
      'Plant scab-resistant apple cultivars.',
      'Rake and compost or burn fallen autumn leaves.',
      'Avoid overhead sprinkler irrigation.'
    ]
  },
  'Apple___Black_rot': {
    crop: 'Apple',
    disease: 'Black Rot',
    scientificName: 'Botryosphaeria obtusa',
    severity: 'High',
    symptoms: [
      'Frogeye leaf spots with purple borders and tan centers',
      'Black rotting on fruit with concentric rings',
      'Bark cankers on branches'
    ],
    actions: [
      'Prune out dead wood, mummified fruits, and cankers during dormancy.',
      'Disinfect pruning tools between cuts.',
      'Apply recommended protective copper or sulfur sprays.'
    ],
    prevention: [
      'Maintain good tree vigor through balanced fertilization.',
      'Promptly remove dead twigs and fallen fruit.',
      'Prevent mechanical injuries to bark.'
    ]
  },
  'Apple___Cedar_apple_rust': {
    crop: 'Apple',
    disease: 'Cedar Apple Rust',
    scientificName: 'Gymnosporangium juniperi-virginianae',
    severity: 'Moderate',
    symptoms: [
      'Bright orange-yellow circular spots on upper leaf surfaces',
      'Small tube-like fruiting structures (aecia) on leaf undersides',
      'Premature defoliation in severe infections'
    ],
    actions: [
      'Rake and remove infected leaves.',
      'Remove nearby eastern red cedar and juniper galls within 500 meters if possible.',
      'Apply preventive fungicide at pink blossom stage through petal fall.'
    ],
    prevention: [
      'Select rust-resistant apple varieties.',
      'Avoid planting apple orchards adjacent to cedar trees.',
      'Inspect surrounding evergreens for galls.'
    ]
  },
  'Apple___healthy': {
    crop: 'Apple',
    disease: 'Healthy',
    scientificName: 'Malus domestica',
    severity: 'Low',
    symptoms: [
      'Leaves are vibrant green with smooth edges',
      'No visible spots, discoloration, or fungal lesions',
      'Vigorous shoot and foliage growth'
    ],
    actions: [
      'Continue routine watering and balanced nutrient management.',
      'Monitor regularly for early signs of pests or disease.',
      'Maintain mulch around tree drip lines.'
    ],
    prevention: [
      'Ensure adequate spacing for good airflow and sunlight.',
      'Follow seasonal pruning schedules.',
      'Inspect foliage weekly during growing season.'
    ]
  },
  'Blueberry___healthy': {
    crop: 'Blueberry',
    disease: 'Healthy',
    scientificName: 'Vaccinium corymbosum',
    severity: 'Low',
    symptoms: [
      'Deep green, glossy foliage without discoloration',
      'Uniform growth without dieback or leaf spotting',
      'Healthy root and shoot development'
    ],
    actions: [
      'Maintain soil pH between 4.5 and 5.2.',
      'Apply pine bark or acidic mulch around root zones.',
      'Ensure consistent, drip-delivered moisture.'
    ],
    prevention: [
      'Test soil acidity annually and amend with sulfur as needed.',
      'Prune older canes to encourage vigorous new growth.',
      'Avoid standing water around roots.'
    ]
  },
  'Cherry_(including_sour)___Powdery_mildew': {
    crop: 'Cherry',
    disease: 'Powdery Mildew',
    scientificName: 'Podosphaera clandestina',
    severity: 'Moderate',
    symptoms: [
      'White powdery fungal patches on young leaves and twigs',
      'Leaves curl upward and become blistered or distorted',
      'Stunted terminal shoot growth'
    ],
    actions: [
      'Prune and dispose of infected shoots to reduce inoculum.',
      'Improve orchard airflow with canopy thinning.',
      'Apply potassium bicarbonate or sulfur sprays in early morning.'
    ],
    prevention: [
      'Avoid overhead watering that keeps foliage humid.',
      'Space trees adequately for direct sunlight penetration.',
      'Monitor young growth flushes closely in warm, dry weather.'
    ]
  },
  'Cherry_(including_sour)___healthy': {
    crop: 'Cherry',
    disease: 'Healthy',
    scientificName: 'Prunus cerasus',
    severity: 'Low',
    symptoms: [
      'Smooth, vibrant green leaves with no powdery residue',
      'Uniform canopy growth with healthy blossoms and fruit set',
      'No necrotic spotting or gumming on branches'
    ],
    actions: [
      'Maintain consistent soil moisture through fruit maturation.',
      'Apply balanced organic fertilizer in early spring.',
      'Protect trees from bird damage with netting if needed.'
    ],
    prevention: [
      'Prune annually during dormant winter season.',
      'Sanitize orchard floor of fallen leaves and fruit.',
      'Monitor for aphid and fruit fly activity.'
    ]
  },
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    crop: 'Corn',
    disease: 'Gray Leaf Spot',
    scientificName: 'Cercospora zeae-maydis',
    severity: 'High',
    symptoms: [
      'Small rectangular tan to gray lesions restricted between leaf veins',
      'Lesions expand and coalesce into large necrotic streaks',
      'Premature drying of upper canopy leaves'
    ],
    actions: [
      'Apply a strobilurin or triazole fungicide if disease reaches ear leaf at tasseling.',
      'Harvest early if stalk lodging risk is high.',
      'Chop and incorporate crop residue into soil post-harvest.'
    ],
    prevention: [
      'Plant corn hybrids with high genetic tolerance to gray leaf spot.',
      'Rotate crops with non-grasses such as soybeans.',
      'Ensure balanced soil potassium levels to improve stalk strength.'
    ]
  },
  'Corn_(maize)___Common_rust_': {
    crop: 'Corn',
    disease: 'Common Rust',
    scientificName: 'Puccinia sorghi',
    severity: 'Moderate',
    symptoms: [
      'Cinnamon-brown oval pustules on both upper and lower leaf surfaces',
      'Pustules rupture epidermal tissue releasing reddish-brown powdery spores',
      'Leaves turn yellow and dry up when pustules are dense'
    ],
    actions: [
      'Monitor lower leaves and spray foliar fungicide if rust advances rapidly before tasseling.',
      'Maintain adequate irrigation to minimize crop stress.',
      'Avoid excessive nitrogen application.'
    ],
    prevention: [
      'Select rust-resistant corn cultivars.',
      'Plant early to escape peak airborne spore windows.',
      'Rotate crops regularly to break fungal buildup.'
    ]
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    crop: 'Corn',
    disease: 'Northern Corn Leaf Blight',
    scientificName: 'Exserohilum turcicum',
    severity: 'High',
    symptoms: [
      'Long, elliptical grayish-green to tan cigar-shaped lesions (2-15 cm)',
      'Dark fungal sporulation visible within lesions during wet weather',
      'Extensive blighting causing premature canopy collapse'
    ],
    actions: [
      'Apply recommended foliar fungicides if lesions appear on third leaf below ear during silking.',
      'Deep plow residue after harvest to bury fungal debris.',
      'Ensure balanced nitrogen and potassium fertilization.'
    ],
    prevention: [
      'Plant resistant hybrids carrying Ht gene resistance.',
      'Practice 2-year crop rotation with non-host crops.',
      'Avoid continuous corn-on-corn planting.'
    ]
  },
  'Corn_(maize)___healthy': {
    crop: 'Corn',
    disease: 'Healthy',
    scientificName: 'Zea mays',
    severity: 'Low',
    symptoms: [
      'Broad, deep green leaves with no lesions or pustules',
      'Strong, erect stalks with uniform ear development',
      'Clean, uninterrupted vein patterns'
    ],
    actions: [
      'Maintain balanced soil nutrients with nitrogen side-dressing.',
      'Ensure adequate irrigation during pollination and grain fill.',
      'Keep fields weed-free.'
    ],
    prevention: [
      'Maintain proper plant population density.',
      'Scout fields bi-weekly for pest and disease signs.',
      'Rotate crops annually.'
    ]
  },
  'Grape___Black_rot': {
    crop: 'Grape',
    disease: 'Black Rot',
    scientificName: 'Guignardia bidwellii',
    severity: 'High',
    symptoms: [
      'Circular reddish-brown spots with dark borders on leaves',
      'Tiny black fruiting bodies (pycnidia) embedded inside leaf spots',
      'Berries turn dark, shrivel into hard black mummies'
    ],
    actions: [
      'Remove all mummified berries from vines and ground.',
      'Prune out infected cane lesions.',
      'Apply protectant fungicides from bud break until veraison.'
    ],
    prevention: [
      'Train vines for maximum sunlight and rapid leaf drying.',
      'Maintain weed-free ground beneath canopies.',
      'Plant less susceptible grape varieties.'
    ]
  },
  'Grape___Esca_(Black_Measles)': {
    crop: 'Grape',
    disease: 'Esca (Black Measles)',
    scientificName: 'Phaeoacremonium aleophilum',
    severity: 'High',
    symptoms: [
      'Tiger-stripe interveinal yellowing and necrosis on leaves',
      'Dark purple spots (measles) on ripening berries',
      'Wood cross-sections show dark streaking or spongy white rot'
    ],
    actions: [
      'Mark symptomatic vines and prune them separately with disinfected tools.',
      'Treat large pruning wounds with wound sealants or biological protectants.',
      'Remove and burn dead or dying cordons.'
    ],
    prevention: [
      'Avoid making large pruning cuts during wet weather.',
      'Use clean, certified nursery stock.',
      'Avoid water stress in established vineyards.'
    ]
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    crop: 'Grape',
    disease: 'Leaf Blight',
    scientificName: 'Pseudocercospora vitis',
    severity: 'Moderate',
    symptoms: [
      'Irregular dark brown to black necrotic spots with indistinct margins',
      'Spots coalesce causing premature leaf yellowing and drop',
      'Reduced photosynthesis weakening fruit ripening'
    ],
    actions: [
      'Collect and burn fallen infected leaves.',
      'Spray copper-based or mancozeb fungicide post-harvest and early season.',
      'Prune to open the vine canopy.'
    ],
    prevention: [
      'Ensure good vine spacing and canopy ventilation.',
      'Avoid excessive overhead moisture.',
      'Maintain optimal soil fertility.'
    ]
  },
  'Grape___healthy': {
    crop: 'Grape',
    disease: 'Healthy',
    scientificName: 'Vitis vinifera',
    severity: 'Low',
    symptoms: [
      'Lush green palmate leaves free of spots and wilting',
      'Firm, clean clusters with uniform berry development',
      'Vigorous cane and shoot extension'
    ],
    actions: [
      'Continue routine canopy management, tucking, and leaf pulling.',
      'Maintain drip irrigation according to seasonal evapotranspiration.',
      'Scout underside of leaves for mite or leafhopper activity.'
    ],
    prevention: [
      'Follow seasonal dormant spray schedules.',
      'Ensure good airflow through shoot positioning.',
      'Maintain balanced vine nutrition.'
    ]
  },
  'Orange___Haunglongbing_(Citrus_greening)': {
    crop: 'Orange',
    disease: 'Citrus Greening',
    scientificName: 'Candidatus Liberibacter asiaticus',
    severity: 'High',
    symptoms: [
      'Asymmetrical yellow blotchy mottling on leaves crossing leaf veins',
      'Yellowing of shoots (yellow dragon)',
      'Small, lopsided fruit that stays green at the bottom with bitter taste'
    ],
    actions: [
      'Quarantine affected area and report to local agricultural authorities.',
      'Control the Asian citrus psyllid vector using targeted management.',
      'Remove severely infected declining trees to protect adjacent orchards.'
    ],
    prevention: [
      'Plant certified disease-free nursery stock.',
      'Install insect screens in nursery areas.',
      'Monitor psyllid populations with yellow sticky traps.'
    ]
  },
  'Peach___Bacterial_spot': {
    crop: 'Peach',
    disease: 'Bacterial Spot',
    scientificName: 'Xanthomonas arboricola pv. pruni',
    severity: 'High',
    symptoms: [
      'Small angular purple-brown spots with water-soaked halos on leaves',
      'Dead tissue drops out creating a shot-hole appearance',
      'Pitted, cracked lesions on ripening peaches'
    ],
    actions: [
      'Apply copper bactericide sprays at leaf fall and dormant bud swell.',
      'Avoid high-pressure overhead irrigation that splashes bacteria.',
      'Prune out cankers during dry dormant periods.'
    ],
    prevention: [
      'Plant resistant peach cultivars.',
      'Maintain windbreaks to reduce sandblasting wound injury.',
      'Provide balanced nitrogen to avoid excessive succulent vegetative growth.'
    ]
  },
  'Peach___healthy': {
    crop: 'Peach',
    disease: 'Healthy',
    scientificName: 'Prunus persica',
    severity: 'Low',
    symptoms: [
      'Lanceolate vibrant green foliage without spots or shot-holes',
      'Healthy fruit growth with smooth, unblemished skin',
      'Strong scaffold branch architecture'
    ],
    actions: [
      'Thin heavy fruit sets to improve individual fruit size and quality.',
      'Maintain regular drip irrigation during fruit swell.',
      'Apply organic mulch around tree bases.'
    ],
    prevention: [
      'Annual winter pruning to maintain open vase canopy.',
      'Clean orchard floor after harvest.',
      'Apply dormant copper oil spray in late winter.'
    ]
  },
  'Pepper,_bell___Bacterial_spot': {
    crop: 'Pepper',
    disease: 'Bacterial Spot',
    scientificName: 'Xanthomonas campestris pv. vesicatoria',
    severity: 'High',
    symptoms: [
      'Small, water-soaked circular spots turning dark brown with yellow halos',
      'Leaf spots drop out giving a ragged appearance',
      'Severe defoliation exposing peppers to sunscald'
    ],
    actions: [
      'Apply copper hydroxide combined with mancozeb upon first symptom detection.',
      'Remove severely infected plants to prevent field spread.',
      'Avoid working in fields when foliage is wet.'
    ],
    prevention: [
      'Use hot-water treated or certified disease-free seed.',
      'Rotate out of Solanaceous crops for at least 2 years.',
      'Employ drip irrigation instead of overhead sprinklers.'
    ]
  },
  'Pepper,_bell___healthy': {
    crop: 'Pepper',
    disease: 'Healthy',
    scientificName: 'Capsicum annuum',
    severity: 'Low',
    symptoms: [
      'Firm, deep green glossy leaves with no chlorosis',
      'Vigorous upright plant branching with sturdy stems',
      'Healthy flowering and blocky fruit formation'
    ],
    actions: [
      'Maintain consistent soil moisture to prevent blossom end rot.',
      'Stake or cage plants as heavy fruit develops.',
      'Side-dress with balanced organic fertilizer during flowering.'
    ],
    prevention: [
      'Mulch soil to regulate temperature and retain moisture.',
      'Maintain 45-60 cm spacing between plants for airflow.',
      'Inspect weekly for aphids and thrips.'
    ]
  },
  'Potato___Early_blight': {
    crop: 'Potato',
    disease: 'Early Blight',
    scientificName: 'Alternaria solani',
    severity: 'Moderate',
    symptoms: [
      'Dark brown to black circular spots with characteristic concentric rings',
      'Yellowing of leaf tissue surrounding older lesions',
      'Premature drying and defoliation of lower leaves'
    ],
    actions: [
      'Remove severely infected lower leaves from the field.',
      'Apply preventative protectant fungicides like chlorothalonil or copper.',
      'Water only at the base early in the day.'
    ],
    prevention: [
      'Plant certified disease-free seed tubers.',
      'Ensure adequate nitrogen and potassium fertility.',
      'Rotate crops with non-solanaceous species for 2-3 years.'
    ]
  },
  'Potato___Late_blight': {
    crop: 'Potato',
    disease: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    severity: 'High',
    symptoms: [
      'Large irregular water-soaked dark brown to purplish lesions on leaves and stems',
      'White delicate fungal fuzz on leaf undersides during humid periods',
      'Rapid collapse and blackening of entire foliage canopy'
    ],
    actions: [
      'Apply systemic fungicide immediately upon early warning.',
      'Destroy infected haulms 2 weeks prior to harvest to protect tubers.',
      'Never leave cull piles near production fields.'
    ],
    prevention: [
      'Plant resistant potato varieties.',
      'Ensure wide hilling to provide deep tuber coverage.',
      'Monitor regional weather alerts for cool, wet blight periods.'
    ]
  },
  'Potato___healthy': {
    crop: 'Potato',
    disease: 'Healthy',
    scientificName: 'Solanum tuberosum',
    severity: 'Low',
    symptoms: [
      'Lush, compound green leaves without spotting or chlorosis',
      'Strong stem growth with robust flowering',
      'No wilting or foliar dieback'
    ],
    actions: [
      'Hill soil around stem bases to protect developing tubers from light.',
      'Maintain consistent, even soil moisture.',
      'Scout regularly for potato beetles and aphids.'
    ],
    prevention: [
      'Plant certified disease-free seed pieces in well-draining soil.',
      'Rotate crops on a 3-year cycle.',
      'Avoid overhead irrigation in late afternoon.'
    ]
  },
  'Raspberry___healthy': {
    crop: 'Raspberry',
    disease: 'Healthy',
    scientificName: 'Rubus idaeus',
    severity: 'Low',
    symptoms: [
      'Compound green serrated leaves free of yellowing or necrotic edges',
      'Vigorous cane emergence without spur blights or lesions',
      'Healthy flower clusters and berry drupelets'
    ],
    actions: [
      'Trellis canes to maintain upright orientation and maximize sunlight.',
      'Prune out spent floricanes immediately after fruiting.',
      'Maintain 5-8 cm organic mulch around rows.'
    ],
    prevention: [
      'Provide adequate spacing for row ventilation.',
      'Ensure excellent root drainage to prevent root rot.',
      'Sanitize pruning shears between rows.'
    ]
  },
  'Soybean___healthy': {
    crop: 'Soybean',
    disease: 'Healthy',
    scientificName: 'Glycine max',
    severity: 'Low',
    symptoms: [
      'Trifoliate rich green leaves without rust pustules or mosaic mottling',
      'Uniform pod set and filling along main stem nodes',
      'Robust nodulated root system'
    ],
    actions: [
      'Monitor soil moisture during flowering and pod development.',
      'Scout for defoliating caterpillars and stink bugs.',
      'Maintain weed-free canopy closure.'
    ],
    prevention: [
      'Inoculate seed with Bradyrhizobium japonicum before planting.',
      'Rotate with corn or small grains.',
      'Avoid field traffic when foliage is wet.'
    ]
  },
  'Squash___Powdery_mildew': {
    crop: 'Squash',
    disease: 'Powdery Mildew',
    scientificName: 'Podosphaera xanthii',
    severity: 'Moderate',
    symptoms: [
      'White circular talcum-like powdery spots on leaf surfaces and petioles',
      'Spots enlarge and merge covering entire leaves',
      'Infected leaves turn yellow, brown, and brittle, exposing fruit to sunburn'
    ],
    actions: [
      'Remove and destroy heavily infested older leaves.',
      'Apply organic potassium bicarbonate, neem oil, or horticultural oils.',
      'Ensure foliar sprays reach both top and bottom leaf surfaces.'
    ],
    prevention: [
      'Select powdery mildew-resistant squash varieties.',
      'Space plants at least 90-120 cm apart for strong air circulation.',
      'Plant in full sunlight with drip irrigation.'
    ]
  },
  'Strawberry___Leaf_scorch': {
    crop: 'Strawberry',
    disease: 'Leaf Scorch',
    scientificName: 'Diplocarpon earlianum',
    severity: 'Moderate',
    symptoms: [
      'Numerous small, irregular purple to dark brown spots on upper leaf surfaces',
      'Spots lack white centers (distinguishing from leaf spot)',
      'Leaves curl up at edges and take on a scorched, burnt appearance'
    ],
    actions: [
      'Remove and dispose of diseased leaves during routine weeding.',
      'Apply protective copper or captan fungicide after renovation.',
      'Avoid excessive spring nitrogen fertilization.'
    ],
    prevention: [
      'Plant certified disease-free strawberry crowns.',
      'Maintain narrow row widths for good aeration.',
      'Renovate beds promptly after final harvest.'
    ]
  },
  'Strawberry___healthy': {
    crop: 'Strawberry',
    disease: 'Healthy',
    scientificName: 'Fragaria × ananassa',
    severity: 'Low',
    symptoms: [
      'Vibrant trifoliate green leaves with clean toothed margins',
      'Robust crown and runner development with white blossoms',
      'Clean, unblemished berry development'
    ],
    actions: [
      'Maintain clean straw mulch under developing fruit.',
      'Provide consistent drip irrigation to keep root zone evenly moist.',
      'Remove excess runners to channel energy into mother plants.'
    ],
    prevention: [
      'Plant on raised beds to promote water drainage.',
      'Replace strawberry beds every 3-4 years.',
      'Sanitize dead leaves during winter cleanup.'
    ]
  },
  'Tomato___Bacterial_spot': {
    crop: 'Tomato',
    disease: 'Bacterial Spot',
    scientificName: 'Xanthomonas perforans',
    severity: 'High',
    symptoms: [
      'Small (less than 3mm) dark brown, water-soaked circular spots on leaves',
      'Lesions may be surrounded by yellow halos',
      'Extensive spotting leads to leaf blight, defoliation, and scabby fruit spots'
    ],
    actions: [
      'Apply a copper bactericide combined with mancozeb early in disease cycle.',
      'Avoid touching or cultivating plants while wet.',
      'Prune lower infected foliage to reduce splash dispersal.'
    ],
    prevention: [
      'Use disease-free certified seed and clean transplants.',
      'Rotate tomato beds away from nightshades for 2 years.',
      'Use drip or soaker hose irrigation instead of overhead watering.'
    ]
  },
  'Tomato___Early_blight': {
    crop: 'Tomato',
    disease: 'Early Blight',
    scientificName: 'Alternaria solani',
    severity: 'Moderate',
    symptoms: [
      'Brown to black spots with distinct concentric rings (target board) on older leaves',
      'Yellowing tissue around lesions progressing from ground level upward',
      'Dark, sunken leathery cankers near soil line on stems'
    ],
    actions: [
      'Remove visibly infected lower leaves and discard far from garden.',
      'Water at soil level in early morning; keep leaves dry.',
      'Apply copper fungicide or chlorothalonil as recommended.'
    ],
    prevention: [
      'Stake and prune plants to improve airflow and keep leaves off soil.',
      'Apply 5-8 cm organic mulch around plant bases.',
      'Rotate tomato and potato crops annually.'
    ]
  },
  'Tomato___Late_blight': {
    crop: 'Tomato',
    disease: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    severity: 'High',
    symptoms: [
      'Large, irregular greenish-black water-soaked lesions on leaves and stems',
      'White fuzzy fungal mold on undersides of leaves in humid weather',
      'Fruit develops large, firm, greasy-brown sunken patches'
    ],
    actions: [
      'Isolate and remove infected plants immediately to prevent neighborhood spread.',
      'Apply protective fungicides before rain events during high-risk cool, damp weather.',
      'Dispose of plant debris by bagging or deep burial; do not compost.'
    ],
    prevention: [
      'Plant resistant tomato cultivars.',
      'Ensure maximum sunlight and wide plant spacing.',
      'Monitor regional disease alerts during cool, wet periods.'
    ]
  },
  'Tomato___Leaf_Mold': {
    crop: 'Tomato',
    disease: 'Leaf Mold',
    scientificName: 'Passalora fulva',
    severity: 'Moderate',
    symptoms: [
      'Pale green to yellow diffuse spots on upper leaf surfaces',
      'Olive-green to brown velvety fungal patches on leaf undersides',
      'Leaves curl, wither, and drop prematurely in high humidity'
    ],
    actions: [
      'Increase greenhouse or tunnel ventilation to reduce humidity.',
      'Remove lower infected leaves to improve lower canopy air movement.',
      'Apply protective biofungicide or copper spray.'
    ],
    prevention: [
      'Space plants generously and prune suckers to promote air circulation.',
      'Avoid wetting foliage during irrigation.',
      'Choose leaf mold-resistant tomato varieties.'
    ]
  },
  'Tomato___Septoria_leaf_spot': {
    crop: 'Tomato',
    disease: 'Septoria Leaf Spot',
    scientificName: 'Septoria lycopersici',
    severity: 'Moderate',
    symptoms: [
      'Numerous small, circular spots (1.5-3mm) with dark brown margins and gray centers',
      'Tiny black specks (pycnidia) visible inside centers of spots',
      'Progressive yellowing and loss of foliage starting from bottom leaves'
    ],
    actions: [
      'Remove infected lower leaves promptly as soon as spots appear.',
      'Apply copper or chlorothalonil spray on a 7-10 day schedule in wet periods.',
      'Wash hands and disinfect tools after handling diseased plants.'
    ],
    prevention: [
      'Mulch heavily beneath plants to prevent soil-borne spores from splashing.',
      'Stake and trellis vines securely off the ground.',
      'Rotate planting locations on a 3-year rotation.'
    ]
  },
  'Tomato___Spider_mites Two-spotted_spider_mite': {
    crop: 'Tomato',
    disease: 'Two-Spotted Spider Mites',
    scientificName: 'Tetranychus urticae',
    severity: 'Moderate',
    symptoms: [
      'Fine yellow or white stippling/speckling on upper leaf surfaces',
      'Delicate silky webbing visible on leaf undersides and branch forks',
      'Leaves turn bronze, dry out, and drop under heavy infestation'
    ],
    actions: [
      'Spray leaf undersides thoroughly with insecticidal soap or neem oil.',
      'Introduce predatory mites for biological control.',
      'Wash foliage with a strong jet of water to dislodge mites in hot, dry weather.'
    ],
    prevention: [
      'Maintain adequate irrigation to reduce dusty, dry conditions mites favor.',
      'Avoid broad-spectrum synthetic pyrethroids that kill natural predators.',
      'Monitor leaf undersides with a hand lens regularly.'
    ]
  },
  'Tomato___Target_Spot': {
    crop: 'Tomato',
    disease: 'Target Spot',
    scientificName: 'Corynespora cassiicola',
    severity: 'Moderate',
    symptoms: [
      'Small brown lesions with light brown centers and dark concentric rings on foliage',
      'Stem lesions are dark and elongated',
      'Fruit displays small brown circular sunken lesions'
    ],
    actions: [
      'Remove heavily infected lower leaves and plant residue.',
      'Improve canopy airflow with regular pruning.',
      'Apply preventive azoxystrobin or copper-based sprays.'
    ],
    prevention: [
      'Space plants 60-90 cm apart in well-ventilated rows.',
      'Maintain good weed control around tomato plots.',
      'Rotate with non-host crops like corn or grasses.'
    ]
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    crop: 'Tomato',
    disease: 'Tomato Yellow Leaf Curl Virus',
    scientificName: 'Tomato yellow leaf curl begomovirus',
    severity: 'High',
    symptoms: [
      'Severe upward curling and cupping of leaf margins',
      'Interveinal yellowing and reduced leaf size',
      'Stunted bushy plant growth with flower abortion and poor fruit yield'
    ],
    actions: [
      'Remove and destroy infected plants promptly in sealed bags.',
      'Control whitefly vectors using insecticidal soaps and yellow sticky traps.',
      'Eliminate nearby weed hosts like nightshade.'
    ],
    prevention: [
      'Plant TYLCV-resistant or tolerant tomato hybrids.',
      'Install insect screening in nursery and greenhouse structures.',
      'Use reflective silver mulches to repel whiteflies.'
    ]
  },
  'Tomato___Tomato_mosaic_virus': {
    crop: 'Tomato',
    disease: 'Tomato Mosaic Virus',
    scientificName: 'Tomato mosaic tobamovirus',
    severity: 'High',
    symptoms: [
      'Mottled light and dark green mosaic patterns on leaves',
      'Leaf distortion, blistering, and fern-like leaf narrowing',
      'Stunted growth and internal brown necrosis in fruit wall tissue'
    ],
    actions: [
      'Remove and destroy infected plants immediately—no chemical cure exists.',
      'Wash hands thoroughly with soap before touching healthy plants.',
      'Disinfect tools in 20% nonfat dry milk or 10% bleach solution.'
    ],
    prevention: [
      'Plant certified ToMV-resistant cultivars.',
      'Avoid smoking or using tobacco products near tomato crops.',
      'Avoid mechanical transmission by minimizing unnecessary handling.'
    ]
  },
  'Tomato___healthy': {
    crop: 'Tomato',
    disease: 'Healthy',
    scientificName: 'Solanum lycopersicum',
    severity: 'Low',
    symptoms: [
      'Vibrant, deep green compound foliage without spotting or curling',
      'Sturdy main stems with strong apical and lateral growth',
      'Healthy blossom set and smooth, even fruit maturation'
    ],
    actions: [
      'Maintain consistent, deep watering at the root zone.',
      'Side-dress with balanced organic compost or tomato fertilizer.',
      'Continue gentle sucker pruning to maintain canopy balance.'
    ],
    prevention: [
      'Apply organic mulch around root zones to retain moisture and suppress weeds.',
      'Support plants with sturdy stakes or cages.',
      'Scout weekly for pests and early fungal spots.'
    ]
  }
}

export function getDiseaseInfo(className: string): DiseaseInfo | undefined {
  return diseaseCatalog[className]
}
