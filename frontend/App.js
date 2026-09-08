import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "http://10.0.2.2:5000";
const purple = "#6941F5";

const request = async (path, method = "GET", token, body) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

function Button({ children, onPress, secondary = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {children}
      </Text>
    </Pressable>
  );
}

function Field({ placeholder, value, onChangeText, secureTextEntry = false }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#A0A0B5"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      style={styles.field}
    />
  );
}

function Auth({ onLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    try {
      setLoading(true);
      if (mode === "register")
        await request("/api/auth/register", "POST", null, {
          fullName: name,
          email,
          password,
        });
      const data = await request("/api/auth/login", "POST", null, {
        email,
        password,
      });
      onLoggedIn(data.token, data.user);
    } catch (error) {
      Alert.alert("Could not continue", error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.authPage}>
      <View style={styles.authOrb} />
      <Text style={styles.logo}>✦</Text>
      <Text style={styles.authTitle}>
        {mode === "login" ? "Welcome back! 👋" : "Create your account"}
      </Text>
      <Text style={styles.subtle}>
        {mode === "login"
          ? "Log in to continue your learning journey"
          : "Your smarter study journey starts here"}
      </Text>
      <View style={styles.authCard}>
        {mode === "register" && (
          <Field placeholder="Full name" value={name} onChangeText={setName} />
        )}
        <Field
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
        />
        <Field
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button onPress={submit}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </Button>
        <Pressable
          onPress={() => setMode(mode === "login" ? "register" : "login")}
        >
          <Text style={styles.switchText}>
            {mode === "login"
              ? "New here? Create an account"
              : "Already have an account? Login"}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.apiHint}>Backend: {API_URL}</Text>
    </SafeAreaView>
  );
}

function Dashboard({ user, token, open }) {
  const [dashboard, setDashboard] = useState(null);
  const refresh = async () => {
    try {
      setDashboard((await request("/api/dashboard", "GET", token)).dashboard);
    } catch (e) {
      Alert.alert("Dashboard", e.message);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const counts = dashboard?.counts || { notes: 0, flashcards: 0, quizzes: 0 };
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>
        Hello, {user?.fullName?.split(" ")[0] || "Learner"}! ✨
      </Text>
      <Text style={styles.subtle}>Let’s continue your learning journey</Text>
      <View style={styles.streak}>
        <View>
          <Text style={styles.streakLabel}>🔥 Streak</Text>
          <Text style={styles.streakNumber}>
            {dashboard?.user?.streak || 0} days
          </Text>
        </View>
        <View style={styles.ring}>
          <Text style={styles.ringText}>75%</Text>
        </View>
        <Text style={styles.small}>Daily goal</Text>
      </View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {[
          ["▣", "AI Chat", "Ask anything", "chat"],
          ["✦", "Quiz", "Test yourself", "quiz"],
          ["▤", "My Notes", "Stay organized", "notes"],
          ["▧", "Flashcards", "Study smarter", "flashcards"],
        ].map(([icon, title, label, page]) => (
          <Pressable
            key={page}
            style={styles.action}
            onPress={() => open(page)}
          >
            <Text style={styles.actionIcon}>{icon}</Text>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Your study library</Text>
      <View style={styles.library}>
        <Metric value={counts.notes} label="Notes" color="#6950FF" />
        <Metric value={counts.flashcards} label="Flashcards" color="#FF8A4C" />
        <Metric value={counts.quizzes} label="Quizzes" color="#23B79B" />
      </View>
      <Text style={styles.sectionTitle}>Continue Learning</Text>
      <View style={styles.continue}>
        <Text style={styles.continueIcon}>▥</Text>
        <View>
          <Text style={styles.actionTitle}>Build a study streak</Text>
          <Text style={styles.actionLabel}>
            Create a note, then review flashcards
          </Text>
        </View>
        <Text style={styles.percent}>60%</Text>
      </View>
    </ScrollView>
  );
}

function Metric({ value, label, color }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value || 0}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
  );
}

function Notes({ token }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("General");
  const load = async () => {
    try {
      setNotes((await request("/api/notes", "GET", token)).notes);
    } catch (e) {
      Alert.alert("Notes", e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const save = async () => {
    try {
      await request("/api/notes", "POST", token, { title, content, subject });
      setTitle("");
      setContent("");
      await load();
    } catch (e) {
      Alert.alert("Note", e.message);
    }
  };
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>My Notes</Text>
      <Text style={styles.subtle}>Keep every concept in one place</Text>
      <View style={styles.composer}>
        <Field placeholder="Note title" value={title} onChangeText={setTitle} />
        <Field
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          multiline
          placeholder="Write your note..."
          placeholderTextColor="#A0A0B5"
          value={content}
          onChangeText={setContent}
          style={[styles.field, styles.textarea]}
        />
        <Button onPress={save}>Save Note</Button>
      </View>
      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.note}>
            <View style={styles.noteBadge}>
              <Text>▤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.actionLabel}>
                {item.content}
              </Text>
              <Text style={styles.subject}>{item.subject}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function Flashcards({ token }) {
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [subject, setSubject] = useState("General");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const load = async () => {
    try {
      setCards((await request("/api/flashcards", "GET", token)).flashcards);
    } catch (e) {
      Alert.alert("Flashcards", e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const add = async () => {
    try {
      await request("/api/flashcards", "POST", token, {
        question,
        answer,
        subject,
      });
      setQuestion("");
      setAnswer("");
      await load();
    } catch (e) {
      Alert.alert("Flashcard", e.message);
    }
  };
  const card = cards[index];
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.screenTitle}>Flashcards</Text>
      <Text style={styles.subtle}>Tap to reveal the answer</Text>
      {card ? (
        <>
          <Text style={styles.cardCount}>
            {index + 1} / {cards.length}
          </Text>
          <Pressable
            onPress={() => setFlipped(!flipped)}
            style={styles.flashcard}
          >
            <Text style={styles.subject}>{card.subject}</Text>
            <Text style={styles.flashText}>
              {flipped ? card.answer : card.question}
            </Text>
            <Text style={styles.flipHint}>
              Tap card to {flipped ? "see question" : "reveal answer"}
            </Text>
          </Pressable>
          <View style={styles.cardControls}>
            <Button
              secondary
              onPress={() => {
                setIndex(Math.max(0, index - 1));
                setFlipped(false);
              }}
            >
              Previous
            </Button>
            <Button
              onPress={() => {
                setIndex(Math.min(cards.length - 1, index + 1));
                setFlipped(false);
              }}
            >
              Next
            </Button>
          </View>
        </>
      ) : (
        <Text style={styles.empty}>
          No flashcards yet. Add your first one below.
        </Text>
      )}
      <View style={styles.composer}>
        <Field
          placeholder="Question"
          value={question}
          onChangeText={setQuestion}
        />
        <Field placeholder="Answer" value={answer} onChangeText={setAnswer} />
        <Field
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <Button onPress={add}>Add Flashcard</Button>
      </View>
    </ScrollView>
  );
}

function Chat({ token }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m your AI Study Buddy. What would you like to learn today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!message.trim()) return;
    const text = message.trim();
    setMessages([...messages, { role: "user", content: text }]);
    setMessage("");
    try {
      setSending(true);
      const data = await request("/api/chat", "POST", token, { message: text });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.message },
      ]);
    } catch (e) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: e.message.includes("high demand")
            ? "AI is busy right now. Please try again in a few minutes. 🌱"
            : e.message,
        },
      ]);
    } finally {
      setSending(false);
    }
  };
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>AI Study Buddy</Text>
      <Text style={styles.subtle}>Ask, learn, and grow</Text>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === "user" && { color: "white" },
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
      />
      <View style={styles.chatInput}>
        <TextInput
          style={styles.chatField}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor="#A0A0B5"
        />
        <Pressable onPress={send} style={styles.send}>
          <Text style={{ color: "white", fontWeight: "800" }}>
            {sending ? "…" : "➤"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Quiz() {
  return (
    <View style={styles.centerScreen}>
      <Text style={styles.bigIcon}>✦</Text>
      <Text style={styles.screenTitle}>Quiz Studio</Text>
      <Text style={[styles.subtle, { textAlign: "center" }]}>
        Create a quiz from your notes, or use AI generation once Gemini is
        available.
      </Text>
      <View style={styles.quizBox}>
        <Text style={styles.actionTitle}>Ready to learn?</Text>
        <Text style={styles.actionLabel}>
          Your quiz history and scores will appear here.
        </Text>
      </View>
    </View>
  );
}

function Profile({ user }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 30 }}>👩‍🎓</Text>
        </View>
        <Text style={styles.profileName}>
          {user?.fullName || "Study Buddy"}
        </Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>
      <Text style={styles.sectionTitle}>Settings</Text>
      {[
        "Edit profile",
        "Study preferences",
        "Notifications",
        "Theme",
        "Help & support",
      ].map((item) => (
        <View key={item} style={styles.setting}>
          <Text>{item}</Text>
          <Text style={styles.settingArrow}>›</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  if (!token)
    return (
      <Auth
        onLoggedIn={(newToken, newUser) => {
          setToken(newToken);
          setUser(newUser);
        }}
      />
    );
  const screens = {
    home: <Dashboard user={user} token={token} open={setTab} />,
    notes: <Notes token={token} />,
    flashcards: <Flashcards token={token} />,
    chat: <Chat token={token} />,
    quiz: <Quiz />,
    profile: <Profile user={user} />,
  };
  const nav = [
    ["⌂", "home", "Home"],
    ["▤", "notes", "Notes"],
    ["✦", "quiz", "Quiz"],
    ["▥", "flashcards", "Study"],
    ["☺", "profile", "Profile"],
  ];
  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      {screens[tab]}
      <View style={styles.nav}>
        {nav.map(([icon, value, label]) => (
          <Pressable
            key={value}
            onPress={() => setTab(value)}
            style={styles.navItem}
          >
            <Text style={[styles.navIcon, tab === value && styles.activeNav]}>
              {icon}
            </Text>
            <Text
              style={[styles.navLabel, tab === value && styles.activeLabel]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#FAFAFF" },
  page: { padding: 22, paddingBottom: 105 },
  screen: { flex: 1, padding: 22, paddingBottom: 86 },
  authPage: {
    flex: 1,
    justifyContent: "center",
    padding: 26,
    backgroundColor: "#F8F7FF",
  },
  authOrb: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#E9E2FF",
    top: -75,
    right: -90,
  },
  logo: { fontSize: 48, color: purple, marginBottom: 20 },
  authTitle: { fontSize: 28, fontWeight: "800", color: "#1E1B33" },
  subtle: { fontSize: 13, color: "#77738D", lineHeight: 20, marginTop: 5 },
  authCard: { marginTop: 28, gap: 12 },
  field: {
    backgroundColor: "white",
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E9E6F2",
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#292542",
  },
  textarea: { height: 92, paddingTop: 14, textAlignVertical: "top" },
  button: {
    minHeight: 51,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: purple,
    borderRadius: 13,
    paddingHorizontal: 18,
  },
  buttonText: { color: "white", fontSize: 15, fontWeight: "800" },
  secondaryButton: { backgroundColor: "#F0EDFF" },
  secondaryText: { color: purple },
  switchText: {
    textAlign: "center",
    color: purple,
    fontWeight: "700",
    fontSize: 13,
    marginTop: 8,
  },
  apiHint: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    fontSize: 11,
    color: "#AAA5B8",
  },
  greeting: { fontSize: 25, fontWeight: "800", color: "#201C3B" },
  streak: {
    marginTop: 20,
    backgroundColor: "#F0EDFF",
    borderRadius: 20,
    padding: 19,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  streakLabel: { fontSize: 13, color: "#5E5980", fontWeight: "700" },
  streakNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: "#32297D",
    marginTop: 3,
  },
  ring: {
    marginLeft: "auto",
    height: 56,
    width: 56,
    borderRadius: 28,
    borderWidth: 6,
    borderColor: purple,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  ringText: { fontSize: 12, fontWeight: "800", color: purple },
  small: { fontSize: 10, color: "#77738D", marginLeft: -53, marginTop: 69 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#25203D",
    marginTop: 25,
    marginBottom: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  action: {
    backgroundColor: "white",
    width: "48.5%",
    borderRadius: 17,
    padding: 14,
    minHeight: 111,
    shadowColor: "#352C66",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIcon: { fontSize: 22, color: purple, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: "800", color: "#302B49" },
  actionLabel: { fontSize: 11, color: "#817D93", marginTop: 4, lineHeight: 16 },
  library: {
    backgroundColor: "white",
    borderRadius: 17,
    flexDirection: "row",
    paddingVertical: 16,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#EEECF5",
  },
  metricValue: { fontSize: 24, fontWeight: "800" },
  continue: {
    backgroundColor: "white",
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  continueIcon: { fontSize: 28, color: purple },
  percent: { marginLeft: "auto", fontWeight: "800", color: purple },
  screenTitle: { fontSize: 25, fontWeight: "800", color: "#24203E" },
  composer: {
    gap: 9,
    backgroundColor: "#F0EDFF",
    borderRadius: 18,
    padding: 12,
    marginTop: 19,
  },
  list: { gap: 11, paddingTop: 14, paddingBottom: 20 },
  note: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
  },
  noteBadge: {
    height: 39,
    width: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBE6FF",
  },
  subject: {
    fontSize: 10,
    fontWeight: "800",
    color: purple,
    textTransform: "uppercase",
    marginTop: 7,
  },
  cardCount: {
    textAlign: "center",
    color: "#827C99",
    fontSize: 12,
    marginTop: 20,
  },
  flashcard: {
    height: 230,
    backgroundColor: "#E9E3FF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    marginTop: 12,
  },
  flashText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#302963",
    textAlign: "center",
    lineHeight: 31,
  },
  flipHint: {
    position: "absolute",
    bottom: 19,
    fontSize: 11,
    color: "#7F75AF",
  },
  cardControls: { flexDirection: "row", gap: 12, marginTop: 14 },
  empty: { marginTop: 30, textAlign: "center", color: "#77738D" },
  messageList: { paddingVertical: 20, gap: 10 },
  bubble: { maxWidth: "82%", padding: 13, borderRadius: 16 },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE9FF",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: purple,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20, color: "#302B49" },
  chatInput: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#ECE9F3",
  },
  chatField: {
    flex: 1,
    height: 48,
    backgroundColor: "#F0EEF7",
    borderRadius: 24,
    paddingHorizontal: 16,
    color: "#292542",
  },
  send: {
    height: 43,
    width: 43,
    borderRadius: 22,
    backgroundColor: purple,
    alignItems: "center",
    justifyContent: "center",
  },
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    alignItems: "center",
  },
  bigIcon: { fontSize: 55, color: purple, marginBottom: 15 },
  quizBox: {
    backgroundColor: "#F0EDFF",
    padding: 20,
    borderRadius: 20,
    marginTop: 30,
    width: "100%",
  },
  profileHero: {
    alignItems: "center",
    backgroundColor: purple,
    padding: 25,
    borderRadius: 22,
  },
  avatar: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },
  profileEmail: { color: "#DDD5FF", fontSize: 12, marginTop: 4 },
  setting: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  settingArrow: { fontSize: 23, color: purple },
  nav: {
    height: 72,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEEAF6",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 9,
  },
  navItem: { alignItems: "center", minWidth: 48 },
  navIcon: { fontSize: 20, color: "#A49FB3" },
  navLabel: { fontSize: 10, color: "#A49FB3", marginTop: 3 },
  activeNav: { color: purple },
  activeLabel: { color: purple, fontWeight: "800" },
});

export default App;
