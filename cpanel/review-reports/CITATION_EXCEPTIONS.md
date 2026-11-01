# Citation exceptions and clinical review

Counts are **candidate-record counts**, not a claim of 180 verified unique publications. Raw source records remain untouched in `website/research-data/publications.json` (23) and `recovered-citation-audit.json` (160). `library-records.json` retains the source provenance for every display candidate; `v2-merge-audit.json` records the three merges and category counts.

| Category | Display candidates |
| --- | ---: |
| Bimatoprost | 4 |
| Tofacitinib / JAK Inhibitors | 81 |
| Finasteride | 19 |
| Melatonin | 76 |
| Total | 180 |

74 of the Melatonin candidates are temporarily filed there because they have no confidently assigned ingredient. Their cards explicitly state that the filing does not establish melatonin research. Two recovered entries contain especially ambiguous/concatenated OCR. Some additional identity duplicates may remain until primary sources can be checked; the source corpus is not clean enough to assert a verified unique publication total.

Five supplied full-text publications were already identified as checked in the source audit. This run independently extracted their first two pages and confirmed these DOI strings (`pdf-citation-checks.json`):

- Piraccini — `10.1111/jdv.17738`, topical finasteride trial. Online 2021 versus journal issue 2022 is retained in the limitations.
- Chikhalkar — `10.4103/idoj.idoj_535_23`, topical tofacitinib study.
- Sardana — `10.4103/idoj.idoj_452_22`, JAK inhibitor review.
- Jin — `10.1111/cts.70544`, oral tofacitinib retrospective study; not the bimatoprost pharmacokinetic paper.
- Purohit — `10.1002/jcph.1360`, topical tofacitinib exposure in atopic dermatitis; online 2018 versus issue 2019 is retained. It is not evidence for scalp-formulation safety.

DOI.org, Crossref and PubMed requests were denied by the environment proxy. No live URL resolution, publisher identity confirmation, retraction/current-status check, or complete evidence-type verification is claimed. Pending titles, OCR DOI candidates, years and authors remain flagged. Human / Review labels are used where supplied evidence supports them; uncertain preclinical records retain **Evidence type unresolved** rather than falsely claiming Animal or Laboratory classification. Primary verification is still required to accurately separate these two categories.

References 05 and 06 include illustrative study titles, years, counts and combination/formulation claims. The implementation follows their visual structure but does not invent those publications or reuse “18 studies” as a verified count. The Blog research sidebar uses supplied source records with their actual current verification status.

Additional clinical/content exceptions retained from the source:

- The bimatoprost 1% PK lead (`10.1111/cts.70710`) and the melatonin review (`10.3390/ijms25105167`) need primary title/metadata checks. The original 40-woman melatonin trial identity/year remains unresolved.
- Reference 01 packaging shows three ingredients and finasteride 0.25%; the physician reference 02 shows four ingredients and finasteride 0.2%. Original labels, cartons and approved wording were not silently corrected.
- Ingredient studies, other vehicles/concentrations and oral regimens do not establish safety, synergy, superiority or efficacy of the finished BioHair X combination. It is not an FDA-approved finished drug.
- Illustrative results/testimonials, product-specific efficacy language, patient-satisfaction statements, supplied profile-photo identity and physician-use claims require owner/clinical substantiation. Source notices remain visible.
- Only approved Blog previews were supplied. Complete article contents and the seven additional archive pages shown schematically in reference 05 remain unavailable; no articles or publication dates beyond the five approved previews were invented.

These are review limitations and release blockers, not evidence of verified product efficacy.
