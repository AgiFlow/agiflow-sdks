from colorama import Fore
from agiflow.config import is_console_log_enabled


class Debugger():
    name: str

    def __init__(self, name):
        self.name = name

    def print(self, color: str, text: str):
        if is_console_log_enabled():
            print(
                color
                + f"{self.name}::{text}"
                + Fore.RESET
            )

    def info(self, text: str):
        self.print(Fore.GREEN, text)

    def warn(self, text: str):
        self.print(Fore.YELLOW, text)

    def error(self, text: str):
        self.print(Fore.RED, text)
