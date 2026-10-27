
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const root = path.join(__dirname, "..");
const envFile = path.join(root, ".env");

if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
        }
    }
}

const APP_ID = process.env.INFERMEDICA_APP_ID;
const APP_KEY = process.env.INFERMEDICA_APP_KEY;
const API = "https://api.infermedica.com/v3";

function json(res, status, value) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(value));
}

function body(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => {
            data += chunk;
            if (data.length > 100000) {
                reject(new Error("Request too large."));
                req.destroy();
            }
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(data || "{}"));
            } catch {
                reject(new Error("Invalid JSON."));
            }
        });
        req.on("error", reject);
    });
}

async function apiRequest(url, method, payload) {
    if (!APP_ID || !APP_KEY) {
        const error = new Error("Add valid Infermedica credentials to the root .env file.");
        error.status = 503;
        throw error;
    }

    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "App-Id": APP_ID,
            "App-Key": APP_KEY,
            "Interview-Id": randomUUID(),
            "Dev-Mode": "true"
        },
        ...(payload ? { body: JSON.stringify(payload) } : {}),
        signal: AbortSignal.timeout(20000)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error("Infermedica response:", response.status, result);
        const error = new Error(
            result.message || "Infermedica request failed."
        );
        error.status = 502;
        throw error;
    }

    return result;
}

function validDemographics(data) {
    return ["female", "male"].includes(data.sex) &&
        Number.isInteger(Number(data.age)) &&
        Number(data.age) >= 1 &&
        Number(data.age) <= 130;
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");

    try {
        if (req.method === "POST" && url.pathname === "/api/search") {
            const data = await body(req);
            const phrase = String(data.phrase || "").trim();

            if (!validDemographics(data) || phrase.length < 2 || phrase.length > 100) {
                return json(res, 400, { error: "Enter a valid age, sex, and symptom search." });
            }

            const params = new URLSearchParams({
                phrase,
                sex: data.sex,
                "age.value": String(Number(data.age)),
                "age.unit": "year",
                max_results: "8"
            });

            const result = await apiRequest(
                `${API}/search?${params.toString()}`,
                "GET"
            );

            return json(res, 200, result);
        }

        if (req.method === "POST" && url.pathname === "/api/diagnosis") {
            const data = await body(req);

            if (!validDemographics(data) ||
                !Array.isArray(data.evidence) ||
                data.evidence.length === 0 ||
                data.evidence.length > 100 ||
                !data.evidence.some(e => e.choice_id === "present")) {
                return json(res, 400, {
                    error: "Provide valid demographics and at least one present symptom."
                });
            }

            const allowedChoices = ["present", "absent", "unknown"];
            const evidence = data.evidence.map(item => {
                if (
                    typeof item.id !== "string" ||
                    !/^[a-zA-Z0-9_]+$/.test(item.id) ||
                    !allowedChoices.includes(item.choice_id)
                ) {
                    throw new Error("Invalid symptom evidence.");
                }

                return {
                    id: item.id,
                    choice_id: item.choice_id,
                    ...(item.source === "initial" ? { source: "initial" } : {})
                };
            });

            const result = await apiRequest(`${API}/diagnosis`, "POST", {
                sex: data.sex,
                age: { value: Number(data.age), unit: "year" },
                evidence
            });

            return json(res, 200, result);
        }

        return json(res, 404, { error: "API route not found." });
    } catch (error) {
        console.error(error.message);
        return json(res, error.status || 400, {
            error: error.status === 503
                ? error.message
                : "The request failed. Check the server terminal and API credentials."
        });
    }
});

server.listen(3001, () => {
    console.log("Clinical API server: http://localhost:3001");
});
