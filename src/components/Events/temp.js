// // LumosAI_frontend/frontend/src/pages/Learn.jsx 
import React, { useEffect, useState, useRef } from "react";
import FieldForm from "../components/FieldForm";
import LeftSidebar from "../components/Learn_page_components/LeftSidebar"; // Adjust the path if necessary
import {FiMenu, FiSun, FiMoon,} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { field_list, progress_url, redis_connection } from "../config";

import RightSidebar from "../components/Learn_page_components/RightSidebar";// Import the RightSidebar component

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl shadow-lg border ${className}`}>{children}</div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);
const CardTitle = ({ className = "", children }) => (
  <div className={`font-semibold text-lg ${className}`}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);


const storedUser = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      console.log("Stored User:", user);
      return user;
    } catch (e) {
      console.error("Failed to parse stored user", e);
      return null;
    }
  })();


export default function Learn({ userField}) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [learningTree, setLearningTree] = useState([]);
  const [mode, setMode] = useState("idle"); 
  const [activeDay, setActiveDay] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [lessonContent, setLessonContent] = useState("");
  const [roadmapReady, setRoadmapReady] = useState(false);

  // 👇 LEFT SIDEBAR STRUCTURE
  const [fields, setFields] = useState([]);
  const [expandedFieldIds, setExpandedFieldIds] = useState([]);

  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const [learnedSet, setLearnedSet] = useState(new Set());
  const [colorMode, setColorMode] = useState(() => {
      return localStorage.getItem("colorMode") || "dark";
  });
  const [progressData, setProgressData] = useState(null);
  const [showAddFieldPopup, setShowAddFieldPopup] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [streamingContent, setStreamingContentState] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [branch, setBranch] = useState("");
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [generatedMap, setGeneratedMap] = useState(() => {
    try {
      const raw = localStorage.getItem("generatedMap");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

    useEffect(() => {
      localStorage.setItem("colorMode", colorMode);
    }, [colorMode]);

    // FETCH USER FIELDS ON MOUNT
    useEffect(() => {
      if (!storedUser?.user_id) return;

      const fetchFields = async () => {
        try {
          const res = await fetch(field_list, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: storedUser.user_id }),
            
          });

          const data = await res.json();
          console.log("FIELD LIST RESPONSE:", data);


          if (data.status === "success") {
            // Convert fields to tree structure
            const tree = data.fields.map((f) => ({
              field: f,
              files: [], // will fill later from roadmap
            }));

            setFieldTree(tree);
            setActiveField(tree[0]?.field || null);
          }
        } catch (err) {
          console.error("Failed to fetch fields", err);
        }
      };

      fetchFields();
    }, []);


    useEffect(() => {
      if (!storedUser?.user_id || !activeField) return;
      console.log("Fetching progress for field:", activeField);
      const fetchProgress = async () => {
        try {
          const res = await fetch(progress_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: storedUser.user_id,
              field: activeField,
            }),
          });

          if (!res.ok) {
            // ❌ Roadmap not yet stored
            setRoadmapReady(false);
            setProgressData(null);
            return;
          }

          // ✅ Roadmap exists in DB
          const data = await res.json();
          setProgressData(data);
          setRoadmapReady(true);
        } catch (e) {
          setRoadmapReady(false);
        }
      };

      fetchProgress();

      // 🔁 OPTIONAL: poll every 3 sec until ready
      const interval = setInterval(fetchProgress, 3000);
      return () => clearInterval(interval);

    }, [activeField]);






    useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);





    // ---------------------------------------- INITIALIZE DAY-01 LESSON -----------------------------------
    useEffect(() => {
  // 1️⃣ Get selected field (NEW USER)
      const selectedField = localStorage.getItem("selectedField");

      if (!selectedField) return;

      // 2️⃣ Build Day-01 (Field Introduction)
      const day01 = {
        day: "Day-01",
        topics: [
          {
            id: "day01_intro",
            title: "Field Introduction",
            content: "",     // content will come from SSE
            source: "agent"  // important flag
          }
        ]
      };

      // 3️⃣ Build sidebar tree
      const tree = [
        {
          field: selectedField,
          days: [day01]
        }
      ];

      // 4️⃣ Update state
      setLearningTree(tree);
      setActiveField(selectedField); // 🔥 REQUIRED
      setActiveDay(day01);
      setActiveTopic(day01.topics[0]);

      console.log("✅ Day-01 initialized for:", selectedField);
    }, []);


    // ---------------------------------------- SSE CONNECTION FOR LESSON DELIVERY -----------------------------------
    useEffect(() => {
      const es = new EventSource(redis_connection);

      es.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.channel === "LESSON_DELIVERED") {
          setMode("live");

          const topic = payload.data.subtopic;
          const lesson = payload.data.lesson;

          setLearningTree(prev => {
            const tree = structuredClone(prev);

            const currentDay = tree[0].days[tree[0].days.length - 1];
            currentDay.topics.push({
              id: topic,
              title: topic,
              source: "agent"
            });

            return tree;
          });

          setActiveTopic(topic);
          setLessonContent(lesson);
        }
      };

      return () => es.close();
    }, []);



  const handleLogout = () => {
    localStorage.clear(); // or remove specific keys
    navigate("/login");
  };

  const handleSelectField = (fieldName) => {
    setActiveField(fieldName);
    setMode("live");

    // INITIAL LEFT SIDEBAR STATE
    setLearningTree([
      {
        field: fieldName,
        days: [
          {
            day: 1,
            label: "Day-01",
            topics: [
              {
                id: "intro",
                title: "Field Introduction",
                source: "agent"
              }
            ]
          }
        ]
      }
    ]);

    setActiveDay(1);
    setActiveTopic("intro");
  };


  const handleDoubt = (topic) => {
    console.log("Doubt clicked for topic:", topic);
    alert("Doubt feature is under construction!");
  };
  const toggleColorMode = () => setColorMode((m) => (m === "dark" ? "light" : "dark"));


  const markLearned = (topicId) => {
    setLearnedSet((prev) => {
      const copy = new Set(prev);
      copy.add(topicId);
      try {
        localStorage.setItem("learnedSet", JSON.stringify(Array.from(copy)));
      } catch {}
      return copy;
    });
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("learnedSet");
      if (raw) setLearnedSet(new Set(JSON.parse(raw)));
    } catch {}
  }, []);


  useEffect(() => {
    window.clearAllCustom = () => {
      localStorage.removeItem("customFields");
      setFields([]);
      console.info("customFields removed; fields cleared.");
    };
    return () => {
      delete window.clearAllCustom;
    };
  }, []);




// ---------------------------------------- Learn page UI -----------------------------------
  return (
    <div className={`min-h-screen ${colorMode === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
      <div className={`flex items-center justify-between px-4 py-3 ${colorMode === "dark" ? "bg-gray-900 border-b border-gray-400" : "bg-gray-200"}`}>
        <div className="flex items-center gap-3">
          <img src="./logo.png" className="w-10 h-10 mb-2 rounded-full z-10" alt="Logo" />
          <h1 className="font-semibold text-2xl">LumosAI</h1>
        </div>
        <div className="relative flex gap-2 items-center" ref={dropdownRef}>
          {/* Theme toggle */}
          <button
            onClick={toggleColorMode}
            className="p-2 rounded bg-gray-700 text-white"
          >
            {colorMode === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {/* User button */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1"
          >
            <img src="./user.png" className="h-4" alt="u" />
            <span>{storedUser?.user_name || "User"}</span>
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className={`absolute right-0 top-full mt-2 w-36 rounded shadow-lg border z-50
                ${
                  colorMode === "dark"
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
            >
              <button
                onClick={() => {
                  navigate("/user-details");
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm
                  ${
                    colorMode === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
              >
                Profile
              </button>

              <button
                onClick={handleLogout}
                className={`w-full text-left px-3 py-2 text-sm text-red-500
                  ${
                    colorMode === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <LeftSidebar
          tree={learningTree}   // 🔥 THIS IS THE KEY
          activeField={activeField}
          activeDay={activeDay}
          activeTopic={activeTopic}
          collapsed={sidebarCollapsed}
          onAddField={() => setShowAddFieldPopup(true)}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          onSelectField={(field) => setActiveField(field)}
          onSelectTopic={(day, topic) => {
            setActiveDay(day);
            setActiveTopic(topic);
          }}
          colorMode={colorMode}
/>




        {/* Main Content */}
        <div className="flex-1 p-4">
          {activeField && (
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">{activeField}</h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  <FiMenu className="text-gray-700" />
                </button>

                {showMenu && (
                  <div className="absolute right-6 mt-20 w-48 bg-white border rounded shadow-lg text-sm z-50">
                    <button onClick={() => { setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Menu Item</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTopic ? (
            <motion.div key={activeTopic.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`${colorMode === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-100"}`}>
                <CardHeader>
                  <CardTitle>{activeTopic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>{isGenerating ? streamingContent : activeTopic.content || "Generating..."}</p>

                  {!isGenerating && (
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => handleDoubt(activeTopic)} className="bg-yellow-500 text-black px-3 py-2 rounded">Doubt Solver</button>

                      <button
                        // onClick={handleNextTopic}
                        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Next Topic
                      </button>
                      {/* inside CardContent actions block (where Next Topic exists) */}
                      <button
                        onClick={async () => {
                          if (!activeField || !activeDay) return;
                          // ask for 3 more topics in this session (you can change count)
                          const dayIndex = activeField.days.indexOf(activeDay);
                          if (dayIndex < 0) return;
                          setIsGenerating(true);
                          const created = await generateMultipleTopics(activeField, dayIndex, 3); // 3 topics
                          setIsGenerating(false);
                          if (created.length > 0) {
                            // set last created as active
                            const freshField = fields.find((f) => f.id === activeField.id) || activeField;
                            const freshDay = freshField.days[dayIndex];
                            const last = created[created.length - 1];
                            setActiveField(freshField);
                            setActiveDay(freshDay);
                            setActiveTopic(freshDay.topics.find((t) => t.id === last.id) || last);
                            setExpandedFieldIds([freshField.id]);
                            if (last.content) streamContent(last.content, setStreamingContentState, setIsGenerating);
                          } else {
                            alert("No topics were created.");
                          }
                        }}
                        className="px-3 py-2 rounded bg-indigo-600 text-white"
                      >
                        + More Topics
                      </button>
                      <button onClick={() => markLearned(activeTopic.id)} className="ml-auto bg-green -600 text-white px-3 py-2 rounded">Mark Learned</button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <p>Select a topic to start learning.</p>
          )}
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          colorMode={colorMode}
          progressData={progressData}
          activeField={activeField}
          roadmapReady={roadmapReady}
        />

      </div>

      {showAddFieldPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <FieldForm
            theme={colorMode}
            submitText="Add Field"
            showClose={true}
            onClose={() => setShowAddFieldPopup(false)}
            onSubmit={(data) => {
              handleAddField(data);
              setShowAddFieldPopup(false);
            }}
          />
        </div>
      )}
    </div>
  );
}