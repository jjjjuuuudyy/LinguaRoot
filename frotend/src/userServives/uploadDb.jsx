import { db, auth } from "../../../firebase";
import { collection, addDoc, serverTimestamp, query, where, doc, getDoc, getDocs, orderBy } from "firebase/firestore";

export const uploadQuizDB = async (level_ch, data) => {
    const correctAnswers = data.map(q => q.answer);

    const quizSet = {
        title: level_ch,
        createdAt: serverTimestamp(),
        data
    };

    try {
        const docRef = await addDoc(collection(db, "quizs"), quizSet);
        // console.log("成功上傳測驗 ID:", docRef.id);
        return { id: docRef.id, ans: correctAnswers };
    } catch (e) {
        console.error("上傳失敗", e);
        return null;
    }
};

export const uploadSituationDB = async (quizId, correctAns, userAns, stars) => {
    const results = evaluateAnswers(correctAns, userAns);

    const situationSet = {
        userId: auth.currentUser?.uid,
        quizId: quizId,
        answeredAt: serverTimestamp(),
        stars: stars ?? [],
        answers: userAns,
        results: results
    }

    try {
        const docRef = await addDoc(collection(db, "situations"), situationSet);
        // console.log("成功上傳答題情形 ID:", docRef.id);
        return docRef.id
    } catch (e) {
        console.error("上傳失敗", e);
    }
};

//比對回答是否正確
const evaluateAnswers = (correctAns, userAns) => {
    return correctAns.map((correctAnswer, index) => {
        const userAnswer = userAns[index];
        let questionSituation;
        if (userAnswer == null || userAnswer == undefined) {
            questionSituation = null;
        } else {
            questionSituation = userAnswer === correctAnswer;
        }
        return {
            isCorrect: questionSituation
        };
    });
};

//計算分數
export const countScore = (results) => {
    if (!results || results.length === 0) return 0;
    const totalQuestions = results.length;
    const correctCount = results.filter(item => item.isCorrect).length;

    const score = (correctCount / totalQuestions) * 100;

    return Math.round(score);
};

export const getQuizSubmitById = async (id) => {
    let situationDocId = null;
    if (typeof id === "string") {
        situationDocId = id;
    } else if (id && typeof id === "object") {
        situationDocId = id.situationID;
    }
    try {
        const docRef = doc(db, "situations", situationDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const submitData = docSnap.data();
            const { quizId } = submitData;

            if (quizId) {
                const quizRef = doc(db, "quizs", String(quizId));
                const quizSnap = await getDoc(quizRef);

                if (quizSnap.exists()) {
                    const quizData = quizSnap.data();
                    return {
                        ...submitData,
                        quiz: quizData
                    };
                } else {
                    console.log("未找到對應的quiz");
                    return {
                        ...submitData,
                        quiz: null
                    };
                }
            }

            return submitData;
        } else {
            console.log("未找到提交測驗");
            return null;
        }
    } catch (error) {
        console.log("取得提交的測驗失敗: ", error);
    }
};

export const getCurrentSituation = async () => {
    const user = auth.currentUser;

    const q = query(
        collection(db, "situations"),
        where("userId", "==", user.uid),
        orderBy("answeredAt", "desc")
    );

    try {
        const querySnapshot = await getDocs(q);
        const situations = [];
        querySnapshot.forEach((doc) => {
            situations.push({
                id: doc.id,
                ...doc.data()
            });
        });

        const enrichedSituations = await Promise.all(
            situations.map(async (s) => {
                if (s.quizId) {
                    try {
                        const quizRef = doc(db, "quizs", s.quizId);
                        const quizSnap = await getDoc(quizRef);
                        if (quizSnap.exists()) {
                            return {
                                ...s,
                                quizType: quizSnap.data().title || "未知",
                            };
                        }
                    } catch (err) {
                        console.error(`取得 quiz ${s.quizId} 失敗:`, err);
                    }
                }
                return { ...s, quizType: "未知類型" };
            })
        );
        // console.log("取得的答題情形：", situations);
        return enrichedSituations;
    } catch (error) {
        console.log("取得失敗: ", error);
        return [];
    }
};

export const getQuizById = async (id) => {
    try {
        const quizRef = doc(db, "quizs", id);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
            const quizData = quizSnap.data();
            return quizData;
        } else {
            console.log("未找到對應的quiz");
            return null;
        }
    } catch (error) {
        console.log("從id取得測驗失敗: ", error);
    }
};