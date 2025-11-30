export type PuzzleCategory = "easy" | "medium" | "hard";

export type Puzzle = {
  id: number;
  title: string;
  description: string;
  starterCode: string;
  check: (code: string) => boolean;
  expectedOutput?: any;
  category: PuzzleCategory;
  points?: number; // 1 = easy, 2 = medium, 3 = hard
};

export const puzzles: Puzzle[] = [
  {
    id: 1,
    title: "Toplama Fonksiyonu",
    description: "Bu fonksiyon iki sayıyı toplamalı. Hatasını düzelt.",
    starterCode: `function sum(a, b) {
  return a - b; // HATA
}
sum(5,3);`,
    check: (code: string) => code.includes("return a + b"),
    expectedOutput: 8,
    category: "easy",
    points: 1,
  },

  {
    id: 2,
    title: "Maksimumu Bul",
    description: "max(a,b) büyük olan sayıyı döndürmeli.",
    starterCode: `function max(a, b) {
  if (a < b) return a; // HATA
  return b;
}
max(5,9);`,
    check: (code: string) =>
      code.includes("if (a > b)") &&
      code.includes("return a") &&
      code.includes("return b"),
    expectedOutput: 9,
    category: "easy",
    points: 1,
  },

  {
    id: 3,
    title: "String'i Ters Çevir",
    description: `reverse(str) fonksiyonu verilen string'i ters döndürmeli.`,
    starterCode: `function reverse(str) {
  return str; // HATA
}
reverse("abc");`,
    check: (code: string) =>
      code.includes("split") && code.includes("reverse") && code.includes("join"),
    expectedOutput: "cba",
    category: "easy",
    points: 1,
  },

  {
    id: 4,
    title: "Asal Sayı Kontrolü",
    description: "isPrime(n) fonksiyonu asal sayıları doğru tespit etmeli.",
    starterCode: `function isPrime(n) {
  return false; // HATA
}
isPrime(7);`,
    check: (code: string) =>
      code.includes("for") &&
      code.includes("%") &&
      code.includes("return true"),
    expectedOutput: true, // isPrime(7)
    category: "medium",
    points: 2,
  },

  {
    id: 5,
    title: "Array Toplamı",
    description: "Tüm sayıları toplayan bir fonksiyon yaz.",
    starterCode: `function total(arr) {
  return 0; // HATA
}
total([1,2,3,4]);`,
    check: (code: string) =>
      code.includes("reduce") || code.includes("sum") || code.includes("+="),
    expectedOutput: 10,
    category: "easy",
    points: 1,
  },

  {
    id: 6,
    title: "En Büyük Sayı",
    description: "Array içindeki en büyük sayıyı döndürmelidir.",
    starterCode: `function maxOf(arr) {
  return arr[0]; // HATA
}
maxOf([3,8,2]);`,
    check: (code: string) => code.includes("Math.max"),
    expectedOutput: 8,
    category: "medium",
    points: 2,
  },

  {
    id: 7,
    title: "Fibonacci",
    description: "n'inci Fibonacci sayısını döndürmelidir (fib(6) = 8).",
    starterCode: `function fib(n) {
  return 1; // HATA
}
fib(6);`,
    check: (code: string) =>
      code.includes("fib(") ||
      (code.includes("for") && code.includes("n - 1")),
    expectedOutput: 8,
    category: "hard",
    points: 3,
  },

  {
    id: 8,
    title: "JSON Parse",
    description: "JSON string'i hatasız olarak parse et.",
    starterCode: `function parseJson(str) {
  return str; // HATA
}
parseJson('{"a":1}');`,
    check: (code: string) => code.includes("JSON.parse"),
    expectedOutput: { a: 1 },
    category: "medium",
    points: 2,
  },

  // C++ PUZZLES
  {
    id: 9,
    title: "C++ Toplama Fonksiyonu",
    description: "İki sayıyı toplayıp sonucu döndür. Hatasını düzelt.",
    starterCode: `#include <iostream>
using namespace std;

int add(int a, int b) {
    return a - b;  // HATA: - yerine +
}

int main() {
    cout << add(5, 3) << endl;
    return 0;
}`,
    check: (code: string) => code.includes("return a + b") && code.includes("#include <iostream>"),
    expectedOutput: 8,
    category: "easy",
    points: 1,
  },

  {
    id: 10,
    title: "C++ Maksimum Sayı",
    description: "max() fonksiyonu iki sayı arasında en büyüğünü döndürmeli.",
    starterCode: `#include <iostream>
using namespace std;

int maximum(int a, int b) {
    if (a < b) return a;  // HATA: < yerine >
    return b;
}

int main() {
    cout << maximum(10, 7) << endl;
    return 0;
}`,
    check: (code: string) => code.includes("if (a > b)") && code.includes("return a"),
    expectedOutput: 10,
    category: "easy",
    points: 1,
  },

  {
    id: 11,
    title: "C++ String Tersleme",
    description: "String'i ters çeviren reverse() fonksiyonu yaz.",
    starterCode: `#include <iostream>
#include <string>
using namespace std;

string reverse(string str) {
    return str;  // HATA: tersleme yok
}

int main() {
    cout << reverse("hello") << endl;
    return 0;
}`,
    check: (code: string) => 
      (code.includes("reverse(str.begin(), str.end())") || 
       code.includes("for") && code.includes("str[") && code.includes("str.length()")) &&
      code.includes("#include <string>"),
    expectedOutput: "olleh",
    category: "easy",
    points: 1,
  },

  {
    id: 12,
    title: "C++ Factorial",
    description: "n! (faktoriyal) hesapla. Örn: 5! = 120",
    starterCode: `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n == 0) return 1;
    return n;  // HATA: n * factorial(n-1) olmalı
}

int main() {
    cout << factorial(5) << endl;
    return 0;
}`,
    check: (code: string) => code.includes("factorial(n - 1)") && code.includes("n *"),
    expectedOutput: 120,
    category: "medium",
    points: 2,
  },

  {
    id: 13,
    title: "C++ Asal Sayı Kontrolü",
    description: "isPrime() - sayının asal olup olmadığını kontrol et.",
    starterCode: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i <= n / 2; i++) {
        if (n % i == 0) return true;  // HATA: false olmalı
    }
    return true;
}

int main() {
    cout << isPrime(7) << endl;
    return 0;
}`,
    check: (code: string) => code.includes("n % i == 0") && code.includes("return false"),
    expectedOutput: true,
    category: "medium",
    points: 2,
  },

  {
    id: 14,
    title: "C++ Array Toplamı",
    description: "Vector/Array içindeki tüm sayıları topla.",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int sumArray(vector<int> arr) {
    int sum = 1;  // HATA: 0 olmalı
    for (int num : arr) {
        sum = sum * num;  // HATA: += olmalı
    }
    return sum;
}

int main() {
    vector<int> nums = {1, 2, 3, 4};
    cout << sumArray(nums) << endl;
    return 0;
}`,
    check: (code: string) => code.includes("sum = 0") && code.includes("sum += num"),
    expectedOutput: 10,
    category: "easy",
    points: 1,
  },

  {
    id: 15,
    title: "C++ Fibonacci Serileri",
    description: "n'inci Fibonacci sayısını hesapla. fib(6) = 8",
    starterCode: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);  // Doğru ama eksik başlangıç
}

int main() {
    cout << fibonacci(6) << endl;  // 8 çıkması lazım
    return 0;
}`,
    check: (code: string) => 
      code.includes("fibonacci(n - 1)") && 
      code.includes("fibonacci(n - 2)") &&
      code.includes("if (n <= 1)"),
    expectedOutput: 8,
    category: "hard",
    points: 3,
  },

  {
    id: 16,
    title: "C++ Çift Sayı Kontrolü",
    description: "isEven() - sayının çift olup olmadığını kontrol et.",
    starterCode: `#include <iostream>
using namespace std;

bool isEven(int n) {
    return n % 2 == 1;  // HATA: == 0 olmalı
}

int main() {
    cout << isEven(4) << endl;  // true
    return 0;
}`,
    check: (code: string) => code.includes("n % 2 == 0"),
    expectedOutput: true,
    category: "easy",
    points: 1,
  },

  {
    id: 17,
    title: "C++ En Büyük Sayı Bul",
    description: "Vector içindeki maksimum değeri döndür.",
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int findMax(vector<int> arr) {
    int max = arr[0];
    for (int num : arr) {
        if (num > max) {
            max = arr[0];  // HATA: max = num olmalı
        }
    }
    return max;
}

int main() {
    vector<int> nums = {3, 8, 2, 9};
    cout << findMax(nums) << endl;  // 9
    return 0;
}`,
    check: (code: string) => code.includes("max = num"),
    expectedOutput: 9,
    category: "medium",
    points: 2,
  },

  {
    id: 18,
    title: "C++ Palindrom Kontrolü",
    description: "Verilen string'in palindrom olup olmadığını kontrol et.",
    starterCode: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isPalindrome(string str) {
    string reversed = str;
    reverse(reversed.begin(), reversed.end());
    return str == reversed;  // Doğru
}

int main() {
    cout << isPalindrome("racecar") << endl;  // true
    return 0;
}`,
    check: (code: string) => 
      code.includes("reverse(") && 
      code.includes("==") &&
      code.includes("#include <string>"),
    expectedOutput: true,
    category: "hard",
    points: 3,
  },

  {
    id: 19,
    title: "C++ Sayı Ters Çevirme",
    description: "Sayının rakamlarını ters çevir. 123 -> 321",
    starterCode: `#include <iostream>
using namespace std;

int reverseNumber(int n) {
    int reversed = 0;
    while (n > 0) {
        reversed = reversed * 10 + (n % 10);
        n = n / 10;
    }
    return reversed;  // Doğru işlem
}

int main() {
    cout << reverseNumber(123) << endl;  // 321
    return 0;
}`,
    check: (code: string) => 
      code.includes("reversed * 10") && 
      code.includes("n % 10") &&
      code.includes("n / 10"),
    expectedOutput: 321,
    category: "medium",
    points: 2,
  },
];
