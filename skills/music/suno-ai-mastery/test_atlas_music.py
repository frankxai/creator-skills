import argparse
import io
import json
import unittest
from unittest import mock

import atlas_music


def args(**overrides):
    values = {
        "model": atlas_music.DEFAULT_MODEL,
        "prompt": "Warm instrumental focus track",
        "custom": False,
        "instrumental": True,
        "vocal_gender": None,
        "title": None,
        "style": None,
        "negative_tags": None,
        "timeout": 10,
        "max_polls": 3,
        "poll_interval": 0,
    }
    values.update(overrides)
    return argparse.Namespace(**values)


class AtlasMusicTests(unittest.TestCase):
    def test_build_payload_omits_unset_optional_fields(self):
        self.assertEqual(
            atlas_music.build_payload(args()),
            {
                "model": atlas_music.DEFAULT_MODEL,
                "prompt": "Warm instrumental focus track",
                "custom": False,
                "instrumental": True,
            },
        )

    @mock.patch("atlas_music.urllib.request.urlopen")
    def test_submit_once_then_poll_until_completed(self, urlopen):
        urlopen.side_effect = [
            mock.MagicMock(
                __enter__=lambda self: io.StringIO(
                    json.dumps({"data": {"id": "pred-1", "status": "created"}})
                ),
                __exit__=lambda *unused: None,
            ),
            mock.MagicMock(
                __enter__=lambda self: io.StringIO(
                    json.dumps({"data": {"id": "pred-1", "status": "processing"}})
                ),
                __exit__=lambda *unused: None,
            ),
            mock.MagicMock(
                __enter__=lambda self: io.StringIO(
                    json.dumps(
                        {
                            "data": {
                                "id": "pred-1",
                                "status": "completed",
                                "outputs": ["https://example.test/track.mp3"],
                            }
                        }
                    )
                ),
                __exit__=lambda *unused: None,
            ),
        ]

        result = atlas_music.submit_and_poll(args(), "test-key")

        self.assertEqual(result["status"], "completed")
        self.assertEqual(urlopen.call_count, 3)
        methods = [call.args[0].get_method() for call in urlopen.call_args_list]
        self.assertEqual(methods, ["POST", "GET", "GET"])


if __name__ == "__main__":
    unittest.main()
