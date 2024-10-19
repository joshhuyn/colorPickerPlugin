function test()
{
    localStorage.setItem("test", 20);
    sessionStorage.setItem("test", 10);
    chrome.storage.local.set("test", 100);
}
