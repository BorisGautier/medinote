# Guide de Contribution MediNote 🩺

Bienvenue et merci de vouloir contribuer à **MediNote** ! Nous sommes ravis que vous souhaitiez améliorer cet outil de santé pour tous. Voici quelques directives pour vous aider à démarrer.

## 🚀 Commencer

1. **Forkez le projet** sur votre compte personnel.
2. **Clonez-le** localement :
   ```bash
   git clone https://github.com/votre-compte/medinote.git
   ```
3. Créez une nouvelle branche pour votre travail :
   ```bash
   git checkout -b feature/ma-super-idee
   ```
4. Suivez les instructions dans le [README.md](README.md) pour lancer le projet avec Docker.

## 🛠️ Cycle de Développement

### Standards de Code
- **Linting** : Nous utilisons ESLint pour assurer une cohérence visuelle. Lancez `npm run lint` pour corriger les erreurs.
- **Tests** : Assurez-vous que tous les tests passent avant de soumettre :
  ```bash
  cd backend && npm test
  cd ../frontend && npm test
  ```
- **Type Safety** : Tout le projet est en **TypeScript**. Merci de bien typer vos variables et vos retours de fonctions.

## 📬 Soumettre une Pull Request (PR)

1. Poussez vos modifications sur votre branche dédiée.
2. Ouvrez une Pull Request vers la branche **dev** (et non main).
3. Remplissez consciencieusement le **Template de Pull Request**.
4. Attendez la relecture du projet par l'administrateur.

## 🛡️ Gouvernance

- **Branche main** : Cette branche est réservée exclusivement aux versions stables de production. Seul l'administrateur peut y pousser des modifications.
- **Branche dev** : C'est la branche d'intégration où toutes les fonctionnalités sont fusionnées et testées ensemble avant le déploiement final.
- **Issues** : Si vous découvrez un bug, merci de signaler via le [Template de Bug](.github/ISSUE_TEMPLATE/bug_report.yml).

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient régies par la [Licence MIT](LICENSE) du projet.

---
MediNote - Pour une santé plus accessible par la technologie.
