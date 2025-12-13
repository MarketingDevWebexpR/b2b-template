import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  ChevronLeft,
  Package,
  RotateCcw,
  CreditCard,
  Sparkles,
} from 'lucide-react-native';

// FAQ Data organized by category
const faqData = [
  {
    id: 'shipping',
    title: 'Livraison et suivi',
    icon: Package,
    questions: [
      {
        question: 'Quels sont les delais de livraison ?',
        answer:
          'Nous livrons en 2-3 jours ouvrés en France métropolitaine. Pour les livraisons internationales, comptez 5-7 jours ouvrés. Les commandes passées avant 14h sont expédiées le jour même.',
      },
      {
        question: 'Comment suivre ma commande ?',
        answer:
          "Un email de confirmation avec un lien de suivi vous est envoyé dès l'expédition de votre commande. Vous pouvez également retrouver ce lien dans votre espace client, rubrique 'Mes commandes'.",
      },
      {
        question: 'La livraison est-elle gratuite ?',
        answer:
          'La livraison est offerte pour toute commande supérieure à 150€ en France métropolitaine. Pour les autres destinations, les frais de port sont calculés en fonction du pays de destination.',
      },
      {
        question: 'Livrez-vous a l\'international ?',
        answer:
          'Oui, nous livrons dans plus de 30 pays. Les frais et délais varient selon la destination. Consultez notre page livraison pour plus de détails.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Retours et remboursements',
    icon: RotateCcw,
    questions: [
      {
        question: 'Quelle est votre politique de retour ?',
        answer:
          'Vous disposez de 30 jours après réception pour retourner votre commande. Les articles doivent être dans leur état d\'origine, non portés et dans leur écrin. Les retours sont gratuits en France.',
      },
      {
        question: 'Comment effectuer un retour ?',
        answer:
          "Connectez-vous à votre espace client et accédez à 'Mes commandes'. Sélectionnez les articles à retourner et imprimez l'étiquette de retour prépayée. Déposez le colis dans un point relais.",
      },
      {
        question: 'Quand serai-je remboursé ?',
        answer:
          'Le remboursement est effectué sous 5-7 jours ouvrés après réception et vérification de votre retour. Vous serez remboursé sur le mode de paiement utilisé lors de la commande.',
      },
      {
        question: 'Puis-je echanger un article ?',
        answer:
          "Oui, vous pouvez demander un échange de taille ou de modèle. Contactez notre service client pour organiser l'échange. Les frais de réexpédition sont offerts pour le premier échange.",
      },
    ],
  },
  {
    id: 'payment',
    title: 'Paiement et securite',
    icon: CreditCard,
    questions: [
      {
        question: 'Quels modes de paiement acceptez-vous ?',
        answer:
          'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, Apple Pay et le paiement en 3 ou 4 fois sans frais via Alma pour les commandes supérieures à 100€.',
      },
      {
        question: 'Mes donnees sont-elles securisees ?',
        answer:
          'Absolument. Toutes les transactions sont sécurisées par un cryptage SSL 256 bits. Nous ne stockons jamais vos informations bancaires. Nos processus sont certifiés PCI-DSS.',
      },
      {
        question: 'Puis-je payer en plusieurs fois ?',
        answer:
          'Oui, pour toute commande supérieure à 100€, vous pouvez opter pour le paiement en 3 ou 4 fois sans frais via notre partenaire Alma. La décision d\'acceptation est instantanée.',
      },
      {
        question: 'Ma commande est refusee, que faire ?',
        answer:
          "Si votre paiement est refusé, vérifiez les informations saisies et le plafond de votre carte. Vous pouvez également essayer un autre mode de paiement ou contacter votre banque.",
      },
    ],
  },
  {
    id: 'care',
    title: 'Entretien des bijoux',
    icon: Sparkles,
    questions: [
      {
        question: 'Comment entretenir mes bijoux en or ?',
        answer:
          "Nettoyez vos bijoux en or avec de l'eau tiède savonneuse et une brosse souple. Rincez à l'eau claire et séchez avec un chiffon doux. Évitez le contact avec les parfums et produits chimiques.",
      },
      {
        question: 'Comment preserver l\'eclat de mes pierres ?',
        answer:
          "Évitez les chocs et frottements. Rangez chaque bijou séparément dans son écrin. Pour les diamants, un nettoyage mensuel à l'eau tiède savonneuse suffit. Les pierres précieuses nécessitent plus de précautions.",
      },
      {
        question: 'Proposez-vous un service de nettoyage ?',
        answer:
          'Oui, nous offrons un nettoyage professionnel gratuit de vos bijoux Maison Bijoux. Prenez rendez-vous dans notre boutique ou envoyez-nous vos pièces par courrier sécurisé.',
      },
      {
        question: 'Comment ranger mes bijoux ?',
        answer:
          "Conservez vos bijoux dans leur écrin d'origine ou dans une boîte à bijoux doublée de tissu. Rangez chaque pièce séparément pour éviter les rayures. Évitez l'humidité et la lumière directe du soleil.",
      },
    ],
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isExpanded, onToggle }: FAQItemProps) {
  return (
    <View className="border-b border-border-light">
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-between py-4 px-4"
      >
        <Text className="font-sans text-text-primary flex-1 pr-4">{question}</Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#8b8b8b" />
        ) : (
          <ChevronDown size={20} color="#8b8b8b" />
        )}
      </Pressable>
      {isExpanded && (
        <View className="px-4 pb-4">
          <Text className="font-sans text-sm text-text-muted leading-relaxed">
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}

interface FAQSectionProps {
  category: (typeof faqData)[0];
  expandedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
}

function FAQSection({ category, expandedItems, onToggleItem }: FAQSectionProps) {
  const Icon = category.icon;

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3 px-6">
        <View className="w-10 h-10 rounded-full bg-hermes-50 items-center justify-center mr-3">
          <Icon size={20} color="#f67828" />
        </View>
        <Text className="font-serif text-lg text-text-primary">{category.title}</Text>
      </View>
      <View className="bg-white mx-4 rounded-elegant border border-border-light overflow-hidden">
        {category.questions.map((item, index) => {
          const itemId = `${category.id}-${index}`;
          return (
            <FAQItem
              key={itemId}
              question={item.question}
              answer={item.answer}
              isExpanded={expandedItems.has(itemId)}
              onToggle={() => onToggleItem(itemId)}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <ChevronLeft size={24} color="#1a1a1a" />
            <Text className="font-sans text-text-primary ml-1">Retour</Text>
          </Pressable>
          <View className="flex-row items-center mb-2">
            <HelpCircle size={28} color="#f67828" />
            <Text className="font-serif text-3xl text-text-primary ml-3">
              Centre d'aide
            </Text>
          </View>
          <Text className="font-sans text-text-muted">
            Trouvez rapidement des reponses a vos questions
          </Text>
        </View>

        {/* Search Bar (Visual only) */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center bg-white border border-border rounded-elegant px-4 py-3">
            <Search size={20} color="#8b8b8b" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher une question..."
              className="flex-1 ml-3 font-sans text-text-primary"
              placeholderTextColor="#8b8b8b"
            />
          </View>
        </View>

        {/* FAQ Sections */}
        <View className="pb-6">
          {faqData.map((category) => (
            <FAQSection
              key={category.id}
              category={category}
              expandedItems={expandedItems}
              onToggleItem={toggleItem}
            />
          ))}
        </View>

        {/* Contact Section */}
        <View className="bg-background-beige px-6 py-8">
          <View className="items-center mb-6">
            <Text className="font-serif text-2xl text-text-primary text-center mb-2">
              Besoin d'aide supplementaire ?
            </Text>
            <View className="w-12 h-0.5 bg-hermes-500 mb-3" />
            <Text className="font-sans text-text-muted text-center text-sm">
              Notre equipe est la pour vous accompagner
            </Text>
          </View>

          {/* Contact Options */}
          <View className="space-y-4">
            {/* Email */}
            <View className="bg-white rounded-elegant p-4 flex-row items-center border border-border-light mb-3">
              <View className="w-12 h-12 rounded-full bg-hermes-50 items-center justify-center">
                <Mail size={22} color="#f67828" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-sans text-xs text-text-muted uppercase tracking-wider mb-1">
                  Email
                </Text>
                <Text className="font-sans text-text-primary">
                  contact@maison-bijoux.fr
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View className="bg-white rounded-elegant p-4 flex-row items-center border border-border-light mb-3">
              <View className="w-12 h-12 rounded-full bg-hermes-50 items-center justify-center">
                <Phone size={22} color="#f67828" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-sans text-xs text-text-muted uppercase tracking-wider mb-1">
                  Telephone
                </Text>
                <Text className="font-sans text-text-primary">
                  01 42 68 53 00
                </Text>
              </View>
            </View>

            {/* Opening Hours */}
            <View className="bg-white rounded-elegant p-4 flex-row items-start border border-border-light">
              <View className="w-12 h-12 rounded-full bg-hermes-50 items-center justify-center">
                <Clock size={22} color="#f67828" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-sans text-xs text-text-muted uppercase tracking-wider mb-1">
                  Horaires d'ouverture
                </Text>
                <Text className="font-sans text-text-primary mb-1">
                  Lundi - Vendredi : 9h00 - 18h00
                </Text>
                <Text className="font-sans text-text-primary mb-1">
                  Samedi : 10h00 - 17h00
                </Text>
                <Text className="font-sans text-text-muted text-sm">
                  Dimanche : Ferme
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Message */}
        <View className="px-6 py-8 items-center">
          <Text className="font-display text-xl text-text-primary text-center leading-relaxed mb-4">
            "Votre satisfaction est notre priorite"
          </Text>
          <View className="items-center">
            <Text className="font-serif text-lg text-hermes-500">Maison Bijoux</Text>
            <Text className="font-sans text-xs text-text-muted mt-1 uppercase tracking-widest">
              Service Client
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
