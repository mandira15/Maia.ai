/**
 * Offline-first pregnancy knowledge base for the Maia Resources Hub.
 * Curated from evidence-based maternal guidelines (WHO, ACOG, NHS) and Maia's local clinical knowledge.
 * Non-diagnostic, educational, and fully accessible without network connectivity.
 */

export const STATIC_RESOURCES_DATA = {
  warningSigns: {
    id: "warning-signs",
    title: "Warning Signs",
    tagline: "Knowing when to monitor, when to call your clinic, and when to seek emergency care.",
    icon: "⚠️",
    categories: [
      {
        level: "emergency",
        title: "🚨 Emergency (Seek Immediate Emergency Care)",
        color: "#dc2626",
        badgeBg: "#fee2e2",
        actionGuidance:
          "Do not wait. Have someone take you to the nearest emergency obstetrics unit immediately, or dial 112 / 108.",
        signs: [
          {
            name: "Heavy Vaginal Bleeding",
            desc: "Soaking a sanitary pad in an hour or passing large blood clots.",
          },
          {
            name: "Severe Abdominal Pain",
            desc: "Sharp, constant, or unremitting pelvic or upper abdominal pain that does not ease.",
          },
          {
            name: "Difficulty Breathing or Chest Pain",
            desc: "Sudden shortness of breath, chest tightness, or respiratory distress.",
          },
          {
            name: "Fainting or Loss of Consciousness",
            desc: "Sudden collapse, passing out, or severe unsteadiness with confusion.",
          },
          {
            name: "Seizures or Fits",
            desc: "Involuntary jerking or sudden convulsion (potential sign of eclampsia).",
          },
        ],
      },
      {
        level: "seek-care-soon",
        title: "🟡 Seek Care Soon (Contact Doctor / Clinic Within Hours)",
        color: "#d97706",
        badgeBg: "#fef3c7",
        actionGuidance:
          "Reach out to your doctor, midwife, or maternity triage team on the same day for an evaluation.",
        signs: [
          {
            name: "Persistent Severe Headache & Vision Changes",
            desc: "Pounding headaches not relieved by rest, accompanied by blurry vision, flashing spots, or aura.",
          },
          {
            name: "Noticeable Decrease in Baby's Movements",
            desc: "After week 24, any noticeable reduction or sudden change in your baby's regular kick pattern.",
          },
          {
            name: "Fluid Leaking Before Term",
            desc: "Continuous trickling or sudden gush of clear or greenish watery fluid.",
          },
          {
            name: "Fever and Chills",
            desc: "Body temperature above 38°C (100.4°F) or persistent shivering.",
          },
          {
            name: "Sudden Severe Swelling",
            desc: "Rapid puffiness in your hands, face, or around your eyes over a single day.",
          },
          {
            name: "Persistent Vomiting with Dehydration",
            desc: "Inability to keep fluids down for over 12-24 hours with dark urine or dizziness.",
          },
        ],
      },
      {
        level: "monitor",
        title: "🟢 Monitor (Common Discomforts to Track)",
        color: "#059669",
        badgeBg: "#d1fae5",
        actionGuidance:
          "Track how often symptoms occur. Mention them at your next routine prenatal appointment, or call sooner if they worsen.",
        signs: [
          {
            name: "Mild Lower Abdominal Cramping",
            desc: "Gentle stretching sensations or Braxton Hicks contractions that ease when changing positions.",
          },
          {
            name: "Occasional Light Nausea",
            desc: "Morning or evening queasiness where you are still able to drink fluids and eat small snacks.",
          },
          {
            name: "Backache and Pelvic Aches",
            desc: "Postural discomfort caused by relaxing ligaments and changing weight distribution.",
          },
          {
            name: "Mild Swelling in Ankles/Feet",
            desc: "Mild puffiness at the end of a long day of standing that reduces when resting with elevated legs.",
          },
          {
            name: "Fatigue and Sleep Changes",
            desc: "Tiredness due to progesterone surges and physical shifts, manageable with rest periods.",
          },
        ],
      },
    ],
  },

  nutrition: {
    id: "nutrition",
    title: "Nutrition & Hydration",
    tagline: "Essential nutrients, safe food practices, and daily hydration guidance.",
    icon: "🥗",
    sections: [
      {
        heading: "Daily Hydration Essentials",
        content:
          "Pregnancy increases your body's blood volume and fluid requirements to support amniotic fluid and placental circulation. Aim for 2.5 to 3.0 liters (approx. 8–10 glasses) of clean fluids daily, with plain water as the primary source. Hydration helps prevent constipation, reduces urinary tract infection risks, and minimizes headaches.",
        tips: [
          "Keep a reusable water bottle visible throughout the day.",
          "Check urine color: pale straw indicates good hydration, dark amber suggests you need more fluids.",
          "If nausea makes water difficult to tolerate, try cool lemon water, coconut water, or weak herbal teas.",
        ],
      },
      {
        heading: "Core Nutritional Building Blocks",
        content:
          "Focus on nutrient-dense whole foods that nourish both maternal tissues and fetal organ development:",
        items: [
          {
            nutrient: "Folate / Folic Acid",
            why: "Crucial for neural tube development and red blood cell production.",
            sources: "Dark leafy greens (spinach, methi), lentils, chickpeas, fortified whole grains.",
          },
          {
            nutrient: "Iron",
            why: "Prevents maternal anemia and supports the increased oxygen supply to your baby.",
            sources: "Beans, lentils, tofu, pumpkin seeds, jaggery in moderation; pair with Vitamin C (oranges, tomatoes) for optimal absorption.",
          },
          {
            nutrient: "Calcium & Vitamin D",
            why: "Builds baby's bones and teeth while protecting maternal bone density.",
            sources: "Milk, curd/yogurt, paneer, ragi, sesame seeds, fortified plant milks.",
          },
          {
            nutrient: "Protein",
            why: "Vital for the rapid growth of fetal tissues, brain, and placenta.",
            sources: "Eggs, dals, legumes, paneer, tofu, well-cooked lean poultry/fish, nuts.",
          },
        ],
      },
      {
        heading: "Food Safety & Precautions",
        content:
          "Hormonal shifts make your immune system slightly more susceptible to foodborne microbes. Protect yourself and baby with simple kitchen habits:",
        tips: [
          "Avoid raw or undercooked meat, poultry, seafood, and runny eggs.",
          "Avoid unpasteurized milk and soft unpasteurized cheeses (such as raw brie or feta).",
          "Wash all fruits, vegetables, and salad leaves thoroughly under running water before eating.",
          "Limit caffeine intake to under 200 mg/day (approx. 1–2 small cups of coffee or tea).",
          "Completely avoid alcohol, tobacco, and recreational substances throughout pregnancy.",
        ],
      },
    ],
  },

  prenatalCare: {
    id: "prenatal-care",
    title: "Prenatal Care & Checkups",
    tagline: "Guidance on clinical visits, safe supplement reminders, and questions to ask your doctor.",
    icon: "🩺",
    sections: [
      {
        heading: "The Value of Routine Prenatal Visits",
        content:
          "Regular antenatal visits allow your healthcare team to check your blood pressure, monitor baby's growth, test for gestational diabetes or anemia, and catch potential concerns before symptoms develop. Even when you feel completely well, keeping scheduled visits is one of the best ways to ensure a healthy pregnancy.",
      },
      {
        heading: "Questions to Ask Your Doctor",
        content:
          "It is completely normal to have questions. Keep a small list on your phone and bring these to your consultations:",
        tips: [
          "Is my current weight gain and blood pressure within a healthy range for my stage?",
          "Are the physical symptoms I am currently feeling typical for this week?",
          "Which over-the-counter remedies are safe for me if I get a cold, headache, or acidity?",
          "What routine scans or blood screenings are scheduled for my next trimester?",
          "When should I register with the hospital or delivery clinic?",
          "What is the best phone number to reach your team after hours or in emergencies?",
        ],
      },
      {
        heading: "Medication & Supplement Safety Reminders",
        content:
          "Important safety rules regarding medicines during pregnancy:",
        tips: [
          "Always take your prescribed prenatal vitamins (such as folic acid and iron) as directed by your clinician.",
          "Never start, stop, or adjust prescription medications without speaking directly to your doctor.",
          "Avoid unverified herbal remedies, unregulated concoctions, and high-dose vitamin A supplements.",
          "Do not assume herbal or 'natural' products are automatically safe during pregnancy.",
        ],
      },
    ],
  },

  mentalWellbeing: {
    id: "mental-wellbeing",
    title: "Mental Wellbeing & Rest",
    tagline: "Emotional care, restorative rest, stress reduction, and knowing when to ask for support.",
    icon: "🧘‍♀️",
    sections: [
      {
        heading: "Nurturing Your Emotional Health",
        content:
          "Pregnancy brings substantial hormonal, physical, and emotional transitions. It is entirely natural to feel a mix of joy, anticipation, anxiety, and fatigue. Caring for your mind is just as essential as tracking your physical vitals.",
      },
      {
        heading: "Restorative Sleep & Rest",
        content:
          "Your body is working continuously to support new life. Prioritize physical restoration:",
        tips: [
          "Aim for 7 to 9 hours of quality sleep each night, complemented by brief rest breaks during the day.",
          "From the second trimester onward, sleeping on your side (especially the left side) optimizes blood flow to the placenta.",
          "Use pillows between your knees and beneath your belly to ease lower back and hip pressure.",
          "Limit screen time 30 minutes before bedtime to support natural melatonin release.",
        ],
      },
      {
        heading: "Practical Stress Management",
        content:
          "Simple daily practices to help calm the nervous system:",
        tips: [
          "Practice 5 minutes of slow diaphragmatic belly breathing when feeling overwhelmed.",
          "Engage in gentle daily movement (such as walking in fresh air or prenatal stretching).",
          "Communicate your feelings openly with your partner, family, or trusted friends.",
          "Give yourself permission to pause tasks and say 'no' to non-essential commitments.",
        ],
      },
      {
        heading: "When to Seek Professional Support",
        content:
          "Perinatal mood changes and anxiety are common and treatable. If you experience persistent sadness, panic, intrusive worries, or difficulty bonding for more than two continuous weeks, please reach out to your healthcare provider, midwife, or a maternal mental health counselor. You deserve compassionate support.",
      },
    ],
  },
};
