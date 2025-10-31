import sys
import builtins

# Keep a reference to the original print BEFORE any override
_original_print = builtins.print

def safe_print(*args, sep=" ", end="\n", **kwargs):
    """
    Safe version of print() that avoids UnicodeEncodeError on Windows consoles.
    Fully supports standard print() behavior and prevents recursion.
    """
    try:
        _original_print(*args, sep=sep, end=end, **kwargs)
    except UnicodeEncodeError:
        clean_args = [str(a).encode("ascii", "ignore").decode() for a in args]
        _original_print(*clean_args, sep=sep, end=end, **kwargs)
